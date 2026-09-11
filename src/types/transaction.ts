export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'UPI'
  | 'Bank Transfer'
  | 'Wallet'
  | 'Other';

export type RecurringFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryId?: string;
  date: string; // ISO date string YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  accountId?: string;
  toAccountId?: string;
  transferId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  search?: string;
  type?: TransactionType | 'all';
  category?: string | 'all';
  paymentMethod?: PaymentMethod | 'all';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export type SortField = 'date' | 'amount' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface TransactionSort {
  field: SortField;
  order: SortOrder;
}
