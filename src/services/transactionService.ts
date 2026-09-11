import { Transaction } from '../types/transaction';
import { StorageService, STORAGE_KEYS } from './storageService';
import { AuthService } from './authService';
import { INITIAL_TRANSACTIONS } from '../constants/seedData';

export class TransactionService {
  private static getStorageKey(): string {
    const user = AuthService.getCurrentUser();
    const userId = user ? user.id : 'usr-demo-001';
    return STORAGE_KEYS.getUserTransactionsKey(userId);
  }

  static getTransactions(userId?: string, filters?: any): Transaction[] {
    const key = userId
      ? STORAGE_KEYS.getUserTransactionsKey(userId)
      : this.getStorageKey();
    let list = StorageService.getItem<Transaction[]>(key, []);

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.notes?.toLowerCase().includes(q)
        );
      }
      if (filters.type && filters.type !== 'all') {
        list = list.filter((t) => t.type === filters.type);
      }
      if (filters.category && filters.category !== 'all') {
        list = list.filter((t) => t.category === filters.category);
      }
      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        list = list.filter((t) => t.paymentMethod === filters.paymentMethod);
      }
      if (filters.startDate) {
        list = list.filter((t) => t.date >= filters.startDate!);
      }
      if (filters.endDate) {
        list = list.filter((t) => t.date <= filters.endDate!);
      }
    }

    return list;
  }

  static saveTransactions(userId: string, transactions: Transaction[]): boolean {
    const key = STORAGE_KEYS.getUserTransactionsKey(userId);
    return StorageService.setItem(key, transactions);
  }

  static createTransaction(
    userId: string,
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Transaction {
    const key = STORAGE_KEYS.getUserTransactionsKey(userId);
    const list = StorageService.getItem<Transaction[]>(key, []);
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newTransaction);
    StorageService.setItem(key, list);
    return newTransaction;
  }

  static updateTransaction(
    userId: string,
    id: string,
    updates: Partial<Transaction>
  ): Transaction | null {
    const key = STORAGE_KEYS.getUserTransactionsKey(userId);
    const list = StorageService.getItem<Transaction[]>(key, []);
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updated: Transaction = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    StorageService.setItem(key, list);
    return updated;
  }

  static deleteTransaction(userId: string, id: string): boolean {
    const key = STORAGE_KEYS.getUserTransactionsKey(userId);
    const list = StorageService.getItem<Transaction[]>(key, []);
    const filtered = list.filter((t) => t.id !== id);
    if (filtered.length === list.length) return false;
    StorageService.setItem(key, filtered);
    return true;
  }

  static getAll(): Transaction[] {
    const key = this.getStorageKey();
    return StorageService.getItem<Transaction[]>(key, []);
  }

  static saveAll(transactions: Transaction[]): boolean {
    const key = this.getStorageKey();
    return StorageService.setItem(key, transactions);
  }

  static getById(id: string): Transaction | undefined {
    const list = this.getAll();
    return list.find((t) => t.id === id);
  }

  static add(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const list = this.getAll();
    const now = new Date().toISOString();
    const user = AuthService.getCurrentUser();
    const userId = user ? user.id : 'usr-demo-001';

    // Link with account
    const accounts = StorageService.getItem<any[]>(STORAGE_KEYS.getUserAccountsKey(userId), []);
    let attachedAccountId = transaction.accountId;
    if (accounts.length > 0) {
      const targetAcc =
        accounts.find((a) => a.id === transaction.accountId) ||
        accounts.find((a) => a.isDefault) ||
        accounts[0];
      if (targetAcc) {
        attachedAccountId = targetAcc.id;
        const delta = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        targetAcc.balance = (targetAcc.balance || 0) + delta;
        StorageService.setItem(STORAGE_KEYS.getUserAccountsKey(userId), accounts);
      }
    }

    const newTransaction: Transaction = {
      ...transaction,
      accountId: attachedAccountId,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newTransaction);
    this.saveAll(list);
    return newTransaction;
  }

  static update(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Transaction | null {
    const list = this.getAll();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const oldTx = list[index];
    const user = AuthService.getCurrentUser();
    const userId = user ? user.id : 'usr-demo-001';

    // Adjust account balance delta
    const accounts = StorageService.getItem<any[]>(STORAGE_KEYS.getUserAccountsKey(userId), []);
    if (accounts.length > 0) {
      const targetAcc = accounts.find((a) => a.id === oldTx.accountId) || accounts[0];
      if (targetAcc) {
        // Revert old
        const oldDelta = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount;
        targetAcc.balance -= oldDelta;
        // Apply new
        const newType = updates.type || oldTx.type;
        const newAmount = updates.amount !== undefined ? updates.amount : oldTx.amount;
        const newDelta = newType === 'income' ? newAmount : -newAmount;
        targetAcc.balance += newDelta;
        StorageService.setItem(STORAGE_KEYS.getUserAccountsKey(userId), accounts);
      }
    }

    const updated: Transaction = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.saveAll(list);
    return updated;
  }

  static delete(id: string): boolean {
    const list = this.getAll();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return false;

    const tx = list[index];
    const user = AuthService.getCurrentUser();
    const userId = user ? user.id : 'usr-demo-001';

    // Revert account balance
    const accounts = StorageService.getItem<any[]>(STORAGE_KEYS.getUserAccountsKey(userId), []);
    if (accounts.length > 0) {
      const targetAcc = accounts.find((a) => a.id === tx.accountId) || accounts[0];
      if (targetAcc) {
        const delta = tx.type === 'income' ? tx.amount : -tx.amount;
        targetAcc.balance -= delta;
        StorageService.setItem(STORAGE_KEYS.getUserAccountsKey(userId), accounts);
      }
    }

    const filtered = list.filter((t) => t.id !== id);
    this.saveAll(filtered);
    return true;
  }

  static resetToSeed(): Transaction[] {
    this.saveAll(INITIAL_TRANSACTIONS);
    return INITIAL_TRANSACTIONS;
  }

  static clearUserTransactions(): Transaction[] {
    this.saveAll([]);
    return [];
  }
}
