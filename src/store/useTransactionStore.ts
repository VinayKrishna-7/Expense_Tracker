import { create } from 'zustand';
import {
  Transaction,
  TransactionFilters,
  TransactionSort,
} from '../types/transaction';
import { TransactionService } from '../services/transactionService';

interface TransactionState {
  transactions: Transaction[];
  filters: TransactionFilters;
  sort: TransactionSort;
  page: number;
  pageSize: number;
  lastDeletedTransaction: Transaction | null;

  // Actions
  fetchTransactions: () => void;
  loadUserTransactions: () => void;
  addTransaction: (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => Transaction;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
  ) => Transaction | null;
  deleteTransaction: (id: string) => boolean;
  undoDelete: () => Transaction | null;
  importTransactions: (newTransactions: Partial<Transaction>[]) => number;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: TransactionSort) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetAll: () => void;
  clearAllTransactions: () => void;
}

const DEFAULT_FILTERS: TransactionFilters = {
  search: '',
  type: 'all',
  category: 'all',
  paymentMethod: 'all',
  startDate: '',
  endDate: '',
  minAmount: undefined,
  maxAmount: undefined,
};

const DEFAULT_SORT: TransactionSort = {
  field: 'date',
  order: 'desc',
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: TransactionService.getAll(),
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
  page: 1,
  pageSize: 10,
  lastDeletedTransaction: null,

  fetchTransactions: () => {
    set({ transactions: TransactionService.getAll() });
  },

  loadUserTransactions: () => {
    set({
      transactions: TransactionService.getAll(),
      filters: DEFAULT_FILTERS,
      page: 1,
      lastDeletedTransaction: null,
    });
  },

  addTransaction: (data) => {
    const newTx = TransactionService.add(data);
    set((state) => ({
      transactions: [newTx, ...state.transactions],
    }));
    return newTx;
  },

  updateTransaction: (id, updates) => {
    const updated = TransactionService.update(id, updates);
    if (updated) {
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? updated : t
        ),
      }));
    }
    return updated;
  },

  deleteTransaction: (id) => {
    const target = get().transactions.find((t) => t.id === id);
    if (!target) return false;

    const success = TransactionService.delete(id);
    if (success) {
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        lastDeletedTransaction: target,
      }));
    }
    return success;
  },

  undoDelete: () => {
    const last = get().lastDeletedTransaction;
    if (!last) return null;

    const restored = TransactionService.add({
      title: last.title,
      amount: last.amount,
      type: last.type,
      category: last.category,
      date: last.date,
      paymentMethod: last.paymentMethod,
      notes: last.notes,
      isRecurring: last.isRecurring,
      recurringFrequency: last.recurringFrequency,
    });

    set((state) => ({
      transactions: [restored, ...state.transactions],
      lastDeletedTransaction: null,
    }));
    return restored;
  },

  importTransactions: (newTransactions) => {
    let count = 0;
    const current = get().transactions;
    const addedList: Transaction[] = [];

    const now = new Date().toISOString();
    for (const item of newTransactions) {
      if (!item.title || !item.amount || !item.type || !item.category || !item.date) {
        continue;
      }
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        title: item.title,
        amount: Number(item.amount),
        type: item.type,
        category: item.category,
        date: item.date,
        paymentMethod: item.paymentMethod || 'Other',
        notes: item.notes || '',
        isRecurring: item.isRecurring || false,
        recurringFrequency: item.recurringFrequency,
        createdAt: now,
        updatedAt: now,
      };
      addedList.push(newTx);
      count++;
    }

    const merged = [...addedList, ...current];
    TransactionService.saveAll(merged);
    set({ transactions: merged });
    return count;
  },

  setFilters: (partialFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...partialFilters },
      page: 1,
    }));
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS, page: 1 });
  },

  setSort: (sort) => {
    set({ sort });
  },

  setPage: (page) => {
    set({ page });
  },

  setPageSize: (pageSize) => {
    set({ pageSize, page: 1 });
  },

  resetAll: () => {
    const resetData = TransactionService.resetToSeed();
    set({
      transactions: resetData,
      filters: DEFAULT_FILTERS,
      sort: DEFAULT_SORT,
      page: 1,
      lastDeletedTransaction: null,
    });
  },

  clearAllTransactions: () => {
    const cleared = TransactionService.clearUserTransactions();
    set({
      transactions: cleared,
      filters: DEFAULT_FILTERS,
      sort: DEFAULT_SORT,
      page: 1,
      lastDeletedTransaction: null,
    });
  },
}));
