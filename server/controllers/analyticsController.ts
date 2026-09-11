import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { generateFinancialInsights } from '../services/insightEngine.js';

export async function getAnalyticsSummary(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  // Past 6 months start date
  const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);

  const [accounts, transactionsCurrentMonth, transactionsSixMonths, budgets, subscriptions] =
    await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: sixMonthsAgo } },
        include: { category: true },
      }),
      prisma.budget.findMany({
        where: { userId },
        include: { category: true },
      }),
      prisma.subscription.findMany({
        where: { userId, status: 'active' },
      }),
    ]);

  // 1. Net worth calculation
  const assets = accounts
    .filter((a) => !a.isLiability && a.type !== 'credit_card' && a.type !== 'loan')
    .reduce((sum, a) => sum + Number(a.balance), 0);

  const liabilities = accounts
    .filter((a) => a.isLiability || a.type === 'credit_card' || a.type === 'loan')
    .reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0);

  const netWorth = assets - liabilities;

  // 2. Month-to-date totals (excluding internal transfers)
  const nonTransferCurrent = transactionsCurrentMonth.filter((t) => t.type !== 'transfer');
  const totalIncome = nonTransferCurrent
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = nonTransferCurrent
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // 3. Category breakdown for current month
  const categoryMap = new Map<string, { id: string; name: string; color: string; amount: number; count: number }>();
  nonTransferCurrent
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const catId = t.categoryId;
      const catName = t.category?.name || 'Uncategorized';
      const catColor = t.category?.color || '#94A3B8';
      const current = categoryMap.get(catId) || { id: catId, name: catName, color: catColor, amount: 0, count: 0 };
      current.amount += Number(t.amount);
      current.count += 1;
      categoryMap.set(catId, current);
    });

  const categoryExpenses = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);

  // 4. Monthly trends (6 months)
  const monthlyTrends: { month: string; income: number; expense: number; savings: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthLabel = d.toLocaleString('default', { month: 'short' });

    const monthTxs = transactionsSixMonths.filter((t) => {
      const td = new Date(t.date);
      return td.getMonth() === m && td.getFullYear() === y && t.type !== 'transfer';
    });

    const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    monthlyTrends.push({
      month: monthLabel,
      income: inc,
      expense: exp,
      savings: inc - exp,
    });
  }

  // 5. Generate dynamic insights & health score
  const insightResult = generateFinancialInsights({
    transactions: transactionsSixMonths.map((t) => ({
      id: t.id,
      type: t.type as 'income' | 'expense' | 'transfer',
      amount: Number(t.amount),
      date: t.date,
      categoryId: t.categoryId,
      categoryName: t.category?.name,
    })),
    budgets: budgets.map((b) => ({
      categoryId: b.categoryId,
      categoryName: b.category?.name,
      monthlyLimit: Number(b.amount),
      currentSpent: 0,
    })),
    accounts: accounts.map((a) => ({
      id: a.id,
      type: a.type,
      balance: Number(a.balance),
      isLiability: a.isLiability,
    })),
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      amount: Number(s.amount),
      billingCycle: s.billingCycle as 'monthly' | 'yearly' | 'weekly',
      status: s.status as 'active' | 'cancelled' | 'paused',
    })),
    currentDate: now,
  });

  res.json({
    success: true,
    data: {
      netWorth: {
        total: netWorth,
        assets,
        liabilities,
      },
      currentMonth: {
        income: totalIncome,
        expense: totalExpense,
        savings: netSavings,
        savingsRate,
      },
      forecast: insightResult.forecast,
      healthScore: insightResult.healthScore,
      insights: insightResult.insights,
      categoryBreakdown: categoryExpenses,
      monthlyTrends,
    },
  });
}
