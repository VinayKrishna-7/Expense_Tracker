import { describe, it, expect } from 'vitest';
import { generateFinancialInsights } from '../../server/services/insightEngine';

describe('Financial Insights & Health Score Engine', () => {
  it('correctly calculates financial health score with high savings and no liabilities', () => {
    const result = generateFinancialInsights({
      transactions: [
        { id: '1', type: 'income', amount: 5000, date: new Date().toISOString(), categoryId: 'c1' },
        { id: '2', type: 'expense', amount: 1500, date: new Date().toISOString(), categoryId: 'c2' },
      ],
      budgets: [
        { categoryId: 'c2', monthlyLimit: 2000, currentSpent: 1500 },
      ],
      accounts: [
        { id: 'a1', type: 'checking', balance: 10000, isLiability: false },
        { id: 'a2', type: 'savings', balance: 25000, isLiability: false },
      ],
      subscriptions: [
        { id: 's1', amount: 15, billingCycle: 'monthly', status: 'active' },
      ],
    });

    expect(result.healthScore.score).toBeGreaterThanOrEqual(80);
    expect(result.healthScore.grade).toMatch(/A|A\+/);
    expect(result.healthScore.metrics.savingsRatePercent).toBe(70);
    expect(result.healthScore.metrics.netWorth).toBe(35000);
  });

  it('detects high subscription burden when recurring costs exceed 12% of income', () => {
    const result = generateFinancialInsights({
      transactions: [
        { id: '1', type: 'income', amount: 2000, date: new Date().toISOString(), categoryId: 'c1' },
      ],
      budgets: [],
      accounts: [
        { id: 'a1', type: 'checking', balance: 2000 },
      ],
      subscriptions: [
        { id: 's1', amount: 100, billingCycle: 'monthly', status: 'active' },
        { id: 's2', amount: 200, billingCycle: 'monthly', status: 'active' },
      ],
    });

    const subWarning = result.insights.find((i) => i.id === 'subscription-burden-high');
    expect(subWarning).toBeDefined();
    expect(subWarning?.type).toBe('warning');
  });

  it('computes daily spend velocity and month-end projection', () => {
    const result = generateFinancialInsights({
      transactions: [
        { id: '1', type: 'expense', amount: 1000, date: new Date().toISOString(), categoryId: 'c1' },
      ],
      budgets: [],
      accounts: [],
      subscriptions: [],
    });

    expect(result.forecast.projectedMonthEndExpense).toBeGreaterThanOrEqual(1000);
    expect(result.forecast.daysElapsed).toBeGreaterThanOrEqual(1);
  });
});
