import { describe, it, expect } from 'vitest';
import {
  calculateIncome,
  calculateExpenses,
  calculateBalance,
  calculateSavingsRate,
  calculateCategoryTotals,
  calculateBudgetsProgress,
  calculateGoalProgress,
  calculatePercentageChange,
} from '../utils/calculations';
import { Transaction } from '../types/transaction';
import { Budget } from '../types/budget';
import { Goal } from '../types/goal';

describe('Financial Calculations Utility', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      title: 'Salary',
      amount: 100000,
      type: 'income',
      category: 'cat-salary',
      date: '2026-09-01',
      paymentMethod: 'Bank Transfer',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'tx-2',
      title: 'Groceries',
      amount: 15000,
      type: 'expense',
      category: 'cat-groceries',
      date: '2026-09-02',
      paymentMethod: 'Credit Card',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'tx-3',
      title: 'Dining out',
      amount: 5000,
      type: 'expense',
      category: 'cat-food',
      date: '2026-09-03',
      paymentMethod: 'UPI',
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('calculates total income accurately', () => {
    expect(calculateIncome(mockTransactions)).toBe(100000);
  });

  it('calculates total expenses accurately', () => {
    expect(calculateExpenses(mockTransactions)).toBe(20000);
  });

  it('calculates balance as Income - Expenses', () => {
    expect(calculateBalance(mockTransactions)).toBe(80000);
  });

  it('calculates savings rate percentage correctly', () => {
    // (100000 - 20000) / 100000 * 100 = 80.0%
    expect(calculateSavingsRate(mockTransactions)).toBe(80);
  });

  it('handles zero income in savings rate without dividing by zero', () => {
    expect(calculateSavingsRate([])).toBe(0);
  });

  it('aggregates expenses per category correctly', () => {
    const totals = calculateCategoryTotals(mockTransactions);
    expect(totals['cat-groceries']).toBe(15000);
    expect(totals['cat-food']).toBe(5000);
    expect(totals['cat-salary']).toBeUndefined(); // Income should never be in category expense totals
  });

  it('calculates budget progress and health status', () => {
    const mockBudgets: Budget[] = [
      {
        id: 'b-1',
        category: 'cat-groceries',
        monthlyLimit: 20000,
        period: '2026-09',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'b-2',
        category: 'cat-food',
        monthlyLimit: 4000, // spent 5000 -> over budget
        period: '2026-09',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const progress = calculateBudgetsProgress(mockBudgets, mockTransactions);
    expect(progress[0].spent).toBe(15000);
    expect(progress[0].remaining).toBe(5000);
    expect(progress[0].percentage).toBe(75);
    expect(progress[0].status).toBe('warning');

    expect(progress[1].spent).toBe(5000);
    expect(progress[1].remaining).toBe(0);
    expect(progress[1].percentage).toBe(125);
    expect(progress[1].status).toBe('danger');
  });

  it('matches budgets with transactions using category ID to name resolution', () => {
    const categories = [
      { id: 'cat-groceries', name: 'Groceries' },
      { id: 'cat-food', name: 'Dining Out' },
    ];
    const mockBudgets: Budget[] = [
      {
        id: 'b-1',
        category: 'Groceries', // Stored by name
        monthlyLimit: 20000,
        period: '2026-09',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const progress = calculateBudgetsProgress(mockBudgets, mockTransactions, categories);
    expect(progress[0].spent).toBe(15000);
    expect(progress[0].percentage).toBe(75);
  });

  it('calculates goal progress and monthly needed contribution', () => {
    const mockGoal: Goal = {
      id: 'g-1',
      title: 'Emergency Fund',
      targetAmount: 100000,
      currentAmount: 60000,
      deadline: '2026-12-31',
      contributions: [],
      createdAt: '',
      updatedAt: '',
    };

    const progress = calculateGoalProgress(mockGoal);
    expect(progress.percentage).toBe(60);
    expect(progress.remainingAmount).toBe(40000);
    expect(progress.monthlyNeeded).toBeGreaterThan(0);
  });

  it('calculates percentage changes safely', () => {
    expect(calculatePercentageChange(120, 100)).toBe(20);
    expect(calculatePercentageChange(80, 100)).toBe(-20);
    expect(calculatePercentageChange(50, 0)).toBe(100);
  });
});
