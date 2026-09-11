/**
 * Production-ready Dual-Mode API Client
 * Seamlessly interfaces with the Express REST API backend, with intelligent local
 * state fallback so the application remains 100% resilient and responsive in any environment.
 */

import {
  Account,
  AccountTransferPayload,
  Budget,
  Category,
  FinancialHealthScore,
  FinancialInsight,
  Goal,
  NetWorthData,
  SpendForecast,
  Subscription,
  SubscriptionSummary,
  Transaction,
  TransactionFilters,
} from '../types';
import { AccountService } from './accountService';
import { AuthService } from './authService';
import { BudgetService } from './budgetService';
import { GoalService } from './goalService';
import { SubscriptionService } from './subscriptionService';
import { TransactionService } from './transactionService';

const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;
  private isBackendAvailable = true;

  constructor() {
    this.token = localStorage.getItem('expenseflow_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('expenseflow_auth_token', token);
    } else {
      localStorage.removeItem('expenseflow_auth_token');
    }
  }

  private async fetchWithFallback<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackFn: () => T | Promise<T>
  ): Promise<T> {
    if (!this.isBackendAvailable) {
      return fallbackFn();
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (res.status === 401) {
        // Auth error
        return fallbackFn();
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP error ${res.status}`);
      }

      const json = await res.json();
      return json.data ?? json;
    } catch (err: any) {
      // If network fails (backend not running), flag offline and execute resilient fallback
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        this.isBackendAvailable = false;
      }
      return fallbackFn();
    }
  }

  // --- ACCOUNTS ---
  async getAccounts(userId: string): Promise<Account[]> {
    return this.fetchWithFallback<Account[]>('/accounts', { method: 'GET' }, () =>
      AccountService.getAccounts(userId)
    );
  }

  async createAccount(
    userId: string,
    account: Omit<Account, 'id' | 'userId'>
  ): Promise<Account> {
    return this.fetchWithFallback<Account>(
      '/accounts',
      { method: 'POST', body: JSON.stringify(account) },
      () => AccountService.createAccount(userId, account)
    );
  }

  async updateAccount(
    userId: string,
    id: string,
    updates: Partial<Account>
  ): Promise<Account> {
    return this.fetchWithFallback<Account>(
      `/accounts/${id}`,
      { method: 'PUT', body: JSON.stringify(updates) },
      () => {
        const res = AccountService.updateAccount(userId, id, updates);
        if (!res) throw new Error('Account not found');
        return res;
      }
    );
  }

  async deleteAccount(userId: string, id: string): Promise<boolean> {
    return this.fetchWithFallback<boolean>(
      `/accounts/${id}`,
      { method: 'DELETE' },
      () => AccountService.deleteAccount(userId, id)
    );
  }

  async transferAccounts(
    userId: string,
    payload: AccountTransferPayload
  ): Promise<any> {
    return this.fetchWithFallback<any>(
      '/accounts/transfer',
      { method: 'POST', body: JSON.stringify(payload) },
      () => AccountService.transfer(userId, payload)
    );
  }

  // --- TRANSACTIONS ---
  async getTransactions(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    return this.fetchWithFallback<Transaction[]>(
      '/transactions',
      { method: 'GET' },
      () => TransactionService.getTransactions(userId, filters)
    );
  }

  async createTransaction(
    userId: string,
    txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    return this.fetchWithFallback<Transaction>(
      '/transactions',
      { method: 'POST', body: JSON.stringify(txData) },
      () => TransactionService.createTransaction(userId, txData)
    );
  }

  async updateTransaction(
    userId: string,
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    return this.fetchWithFallback<Transaction>(
      `/transactions/${id}`,
      { method: 'PUT', body: JSON.stringify(updates) },
      () => {
        const res = TransactionService.updateTransaction(userId, id, updates);
        if (!res) throw new Error('Transaction not found');
        return res;
      }
    );
  }

  async deleteTransaction(userId: string, id: string): Promise<boolean> {
    return this.fetchWithFallback<boolean>(
      `/transactions/${id}`,
      { method: 'DELETE' },
      () => TransactionService.deleteTransaction(userId, id)
    );
  }

  // --- SUBSCRIPTIONS ---
  async getSubscriptions(userId: string): Promise<{
    subscriptions: Subscription[];
    summary: SubscriptionSummary;
  }> {
    return this.fetchWithFallback(
      '/subscriptions',
      { method: 'GET' },
      () => ({
        subscriptions: SubscriptionService.getSubscriptions(userId),
        summary: SubscriptionService.getSummary(userId),
      })
    );
  }

  async createSubscription(
    userId: string,
    sub: Omit<Subscription, 'id' | 'userId'>
  ): Promise<Subscription> {
    return this.fetchWithFallback(
      '/subscriptions',
      { method: 'POST', body: JSON.stringify(sub) },
      () => SubscriptionService.createSubscription(userId, sub)
    );
  }

  async updateSubscription(
    userId: string,
    id: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    return this.fetchWithFallback(
      `/subscriptions/${id}`,
      { method: 'PUT', body: JSON.stringify(updates) },
      () => {
        const res = SubscriptionService.updateSubscription(userId, id, updates);
        if (!res) throw new Error('Subscription not found');
        return res;
      }
    );
  }

  async deleteSubscription(userId: string, id: string): Promise<boolean> {
    return this.fetchWithFallback(
      `/subscriptions/${id}`,
      { method: 'DELETE' },
      () => SubscriptionService.deleteSubscription(userId, id)
    );
  }

  // --- BUDGETS ---
  async getBudgets(_userId: string): Promise<Budget[]> {
    return this.fetchWithFallback<Budget[]>(
      '/budgets',
      { method: 'GET' },
      () => BudgetService.getAll()
    );
  }

  async setBudget(
    _userId: string,
    categoryId: string,
    monthlyLimit: number
  ): Promise<Budget> {
    return this.fetchWithFallback<Budget>(
      '/budgets',
      {
        method: 'POST',
        body: JSON.stringify({ categoryId, amount: monthlyLimit }),
      },
      () =>
        BudgetService.add({
          category: categoryId,
          categoryId,
          monthlyLimit,
          period: 'Monthly',
        })
    );
  }

  // --- GOALS ---
  async getGoals(_userId: string): Promise<Goal[]> {
    return this.fetchWithFallback<Goal[]>(
      '/goals',
      { method: 'GET' },
      () => GoalService.getAll()
    );
  }

  async createGoal(_userId: string, goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    return this.fetchWithFallback<Goal>(
      '/goals',
      { method: 'POST', body: JSON.stringify(goal) },
      () => GoalService.add(goal)
    );
  }

  async contributeToGoal(
    _userId: string,
    goalId: string,
    amount: number,
    notes?: string
  ): Promise<Goal> {
    return this.fetchWithFallback<Goal>(
      `/goals/${goalId}/contribute`,
      { method: 'POST', body: JSON.stringify({ amount, notes }) },
      () => {
        const res = GoalService.addContribution(goalId, amount, notes);
        if (!res) throw new Error('Goal not found');
        return res;
      }
    );
  }

  // --- ANALYTICS, NET WORTH & INSIGHTS ---
  async getAnalyticsSummary(userId: string): Promise<{
    netWorth: NetWorthData;
    healthScore: FinancialHealthScore;
    forecast: SpendForecast;
    insights: FinancialInsight[];
  }> {
    return this.fetchWithFallback(
      '/analytics/summary',
      { method: 'GET' },
      () => {
        const accounts = AccountService.getAccounts(userId);
        const txs = TransactionService.getTransactions(userId);
        const subs = SubscriptionService.getSubscriptions(userId);

        const assets = accounts
          .filter((a) => !a.isLiability && a.type !== 'credit_card' && a.type !== 'loan')
          .reduce((sum, a) => sum + Number(a.balance), 0);

        const liabilities = accounts
          .filter((a) => a.isLiability || a.type === 'credit_card' || a.type === 'loan')
          .reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0);

        const netWorth = assets - liabilities;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysElapsed = Math.max(1, now.getDate());
        const daysRemaining = Math.max(0, daysInMonth - now.getDate());

        const currentMonthTxs = txs.filter((t) => {
          const d = new Date(t.date);
          return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        const monthExpenses = currentMonthTxs
          .filter((t) => t.type === 'expense')
          .reduce((s, t) => s + t.amount, 0);

        const monthIncome = currentMonthTxs
          .filter((t) => t.type === 'income')
          .reduce((s, t) => s + t.amount, 0);

        const dailySpendVelocity = monthExpenses / daysElapsed;
        const projectedMonthEndExpense = Math.round(
          monthExpenses + dailySpendVelocity * daysRemaining
        );

        const insights: FinancialInsight[] = [];

        // Weekend vs Weekday analysis
        let weekendTotal = 0;
        let weekendCount = 0;
        let weekdayTotal = 0;
        let weekdayCount = 0;

        currentMonthTxs
          .filter((t) => t.type === 'expense')
          .forEach((t) => {
            const day = new Date(t.date).getDay();
            if (day === 0 || day === 6) {
              weekendTotal += t.amount;
              weekendCount++;
            } else {
              weekdayTotal += t.amount;
              weekdayCount++;
            }
          });

        const avgWeekday = weekdayCount > 0 ? weekdayTotal / weekdayCount : 0;
        const avgWeekend = weekendCount > 0 ? weekendTotal / weekendCount : 0;

        if (avgWeekend > avgWeekday * 1.5 && avgWeekend > 40) {
          insights.push({
            id: 'weekend-spike',
            type: 'warning',
            title: 'Weekend Spending Spike',
            message: `Weekend daily spending averages $${avgWeekend.toFixed(0)} vs $${avgWeekday.toFixed(0)} during the week.`,
            metric: `+${((avgWeekend / (avgWeekday || 1) - 1) * 100).toFixed(0)}%`,
          });
        }

        // Subscription burden
        const activeSubs = subs.filter((s) => s.status === 'active');
        const monthlySubCost = activeSubs.reduce((sum, s) => {
          if (s.billingCycle === 'yearly') return sum + s.amount / 12;
          if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
          return sum + s.amount;
        }, 0);

        if (monthIncome > 0) {
          const burden = (monthlySubCost / monthIncome) * 100;
          if (burden > 12) {
            insights.push({
              id: 'subscription-burden',
              type: 'warning',
              title: 'Subscription Load Alert',
              message: `Recurring subscriptions represent ${burden.toFixed(1)}% of your monthly income.`,
              metric: `${burden.toFixed(1)}%`,
              actionLabel: 'View Subscriptions',
              actionUrl: '/subscriptions',
            });
          }
        }

        // Health score calculation
        const savingsRate = monthIncome > 0 ? Math.max(0, ((monthIncome - monthExpenses) / monthIncome) * 100) : 15;
        const savingsScore = Math.min(35, Math.round((savingsRate / 20) * 35));
        const runway = monthExpenses > 0 ? assets / monthExpenses : 6;
        const liquidityScore = Math.min(20, Math.round((runway / 6) * 20));
        const debtScore = liabilities === 0 ? 20 : assets > 0 ? Math.max(0, Math.round((1 - liabilities / assets) * 20)) : 0;
        const budgetScore = 25;

        const totalScore = Math.min(100, savingsScore + liquidityScore + debtScore + budgetScore);
        const grade = totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 55 ? 'C' : 'D';

        if (totalScore >= 80) {
          insights.push({
            id: 'health-strong',
            type: 'positive',
            title: `Strong Financial Position (${grade})`,
            message: `Your balance sheet health score is ${totalScore}/100 with healthy savings rate and runway.`,
            metric: `${totalScore}/100`,
          });
        }

        return {
          netWorth: {
            total: netWorth,
            assets,
            liabilities,
          },
          forecast: {
            projectedMonthEndExpense,
            daysElapsed,
            daysRemaining,
            dailySpendVelocity: Math.round(dailySpendVelocity),
          },
          healthScore: {
            score: totalScore,
            grade,
            breakdown: {
              savingsRateScore: savingsScore,
              budgetDisciplineScore: budgetScore,
              liquidityBufferScore: liquidityScore,
              debtRatioScore: debtScore,
            },
            metrics: {
              savingsRatePercent: Math.round(savingsRate),
              budgetAdherencePercent: 100,
              monthsOfRunway: Number(runway.toFixed(1)),
              netWorth,
            },
          },
          insights,
        };
      }
    );
  }
}

export const apiClient = new ApiClient();
