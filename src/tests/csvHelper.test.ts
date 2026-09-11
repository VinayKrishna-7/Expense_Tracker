import { describe, it, expect } from 'vitest';
import { exportToCSV, parseCSV } from '../utils/csvHelper';
import { Transaction } from '../types/transaction';
import { DEFAULT_CATEGORIES } from '../constants/categories';

describe('CSV Helper Utility', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      title: 'Swiggy Dinner',
      amount: 850,
      type: 'expense',
      category: 'cat-food',
      date: '2026-09-01',
      paymentMethod: 'UPI',
      notes: 'Pizza night',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'tx-2',
      title: 'Consulting Income',
      amount: 25000,
      type: 'income',
      category: 'cat-freelance',
      date: '2026-09-02',
      paymentMethod: 'Bank Transfer',
      notes: 'App redesign',
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('exports transactions to valid CSV format', () => {
    const csv = exportToCSV(mockTransactions, DEFAULT_CATEGORIES);
    expect(csv).toContain('Date,Title,Type,Category,Amount,Payment Method,Notes,Recurring');
    expect(csv).toContain('2026-09-01,Swiggy Dinner,expense,Food & Dining,850,UPI,Pizza night,No');
    expect(csv).toContain('2026-09-02,Consulting Income,income,Freelance & Consulting,25000,Bank Transfer,App redesign,No');
  });

  it('parses valid CSV text correctly', () => {
    const csvContent = `Date,Title,Type,Category,Amount,Payment Method,Notes\n2026-09-05,"Grocery Shopping","expense","Groceries & Mart",2450,"UPI","Vegetables"`;
    const result = parseCSV(csvContent, DEFAULT_CATEGORIES);

    expect(result.valid.length).toBe(1);
    expect(result.invalid.length).toBe(0);
    expect(result.valid[0].title).toBe('Grocery Shopping');
    expect(result.valid[0].amount).toBe(2450);
    expect(result.valid[0].type).toBe('expense');
  });

  it('detects and isolates invalid CSV rows with diagnostics', () => {
    const csvContent = `Date,Title,Type,Category,Amount,Payment Method\ninvalid-date,"Test item","invalid-type","Food",-500,"UPI"`;
    const result = parseCSV(csvContent, DEFAULT_CATEGORIES);

    expect(result.valid.length).toBe(0);
    expect(result.invalid.length).toBe(1);
    expect(result.invalid[0].error).toContain('Invalid date format');
  });
});
