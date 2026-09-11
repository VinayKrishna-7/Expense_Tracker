import { Account, AccountTransferPayload, Transaction } from '../types';
import { StorageService, STORAGE_KEYS } from './storageService';
import { TransactionService } from './transactionService';

export class AccountService {
  static getAccounts(userId: string): Account[] {
    const defaultAccounts: Account[] = [
      {
        id: 'acc_primary_checking',
        userId,
        name: 'Primary Checking',
        type: 'checking',
        balance: 0,
        currency: 'USD',
        isDefault: true,
        color: '#2563EB',
      },
      {
        id: 'acc_emergency_savings',
        userId,
        name: 'High-Yield Savings',
        type: 'savings',
        balance: 0,
        currency: 'USD',
        color: '#10B981',
      },
      {
        id: 'acc_credit_card',
        userId,
        name: 'Sapphire Credit Card',
        type: 'credit_card',
        balance: 0,
        currency: 'USD',
        isLiability: true,
        creditLimit: 5000,
        color: '#8B5CF6',
      },
    ];

    const stored = StorageService.getItem<Account[]>(
      STORAGE_KEYS.getUserAccountsKey(userId),
      []
    );

    if (!stored || stored.length === 0) {
      StorageService.setItem(STORAGE_KEYS.getUserAccountsKey(userId), defaultAccounts);
      return defaultAccounts;
    }

    return stored;
  }

  static createAccount(userId: string, accountData: Omit<Account, 'id' | 'userId'>): Account {
    const accounts = this.getAccounts(userId);
    const newAccount: Account = {
      ...accountData,
      id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newAccount.isDefault) {
      accounts.forEach((a) => (a.isDefault = false));
    }

    const updated = [newAccount, ...accounts];
    StorageService.setItem(STORAGE_KEYS.getUserAccountsKey(userId), updated);
    return newAccount;
  }

  static updateAccount(userId: string, id: string, updates: Partial<Account>): Account | null {
    const accounts = this.getAccounts(userId);
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    if (updates.isDefault) {
      accounts.forEach((a) => (a.isDefault = false));
    }

    const updatedAccount = {
      ...accounts[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    accounts[idx] = updatedAccount;
    StorageService.setItem(STORAGE_KEYS.getUserAccountsKey(userId), accounts);
    return updatedAccount;
  }

  static deleteAccount(userId: string, id: string): boolean {
    const accounts = this.getAccounts(userId);
    if (accounts.length <= 1) {
      throw new Error('You must maintain at least one account.');
    }

    const filtered = accounts.filter((a) => a.id !== id);
    if (filtered.length === accounts.length) return false;

    // If the deleted one was default, set the first one as default
    if (accounts.find((a) => a.id === id)?.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }

    StorageService.setItem(STORAGE_KEYS.getUserAccountsKey(userId), filtered);
    return true;
  }

  static transfer(userId: string, payload: AccountTransferPayload): {
    debitTx: Transaction;
    creditTx: Transaction;
    fromAccount: Account;
    toAccount: Account;
  } {
    const accounts = this.getAccounts(userId);
    const fromAcc = accounts.find((a) => a.id === payload.fromAccountId);
    const toAcc = accounts.find((a) => a.id === payload.toAccountId);

    if (!fromAcc || !toAcc) {
      throw new Error('Source or destination account not found.');
    }

    if (fromAcc.id === toAcc.id) {
      throw new Error('Source and destination accounts must be different.');
    }

    const timestamp = new Date().toISOString();
    const debitTxId = `tx_transfer_out_${Date.now()}`;
    const creditTxId = `tx_transfer_in_${Date.now() + 1}`;

    const description =
      payload.description || `Transfer from ${fromAcc.name} to ${toAcc.name}`;

    // Create paired transactions
    const debitTx: Transaction = {
      id: debitTxId,
      title: description,
      amount: payload.amount,
      type: 'transfer',
      category: 'Transfer',
      date: payload.date,
      paymentMethod: 'Bank Transfer',
      notes: `Transfer Out to ${toAcc.name}`,
      accountId: fromAcc.id,
      toAccountId: toAcc.id,
      transferId: creditTxId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const creditTx: Transaction = {
      id: creditTxId,
      title: description,
      amount: payload.amount,
      type: 'transfer',
      category: 'Transfer',
      date: payload.date,
      paymentMethod: 'Bank Transfer',
      notes: `Transfer In from ${fromAcc.name}`,
      accountId: toAcc.id,
      toAccountId: fromAcc.id,
      transferId: debitTxId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Update balances
    const fee = payload.fee || 0;
    fromAcc.balance -= payload.amount + fee;
    toAcc.balance += payload.amount;

    // Save accounts
    StorageService.setItem(STORAGE_KEYS.getUserAccountsKey(userId), accounts);

    // Save transactions
    const txs = TransactionService.getTransactions(userId);
    TransactionService.saveTransactions(userId, [debitTx, creditTx, ...txs]);

    return { debitTx, creditTx, fromAccount: fromAcc, toAccount: toAcc };
  }
}
