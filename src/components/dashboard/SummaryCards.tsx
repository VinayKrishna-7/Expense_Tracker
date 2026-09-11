import React from 'react';
import { StatCard } from '../ui/StatCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
} from 'lucide-react';
import {
  calculateBalance,
  calculateIncome,
  calculateExpenses,
  calculateSavingsRate,
  calculatePercentageChange,
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { parseISO, subMonths, isSameMonth } from 'date-fns';

export const SummaryCards: React.FC = () => {
  const transactions = useTransactionStore((s) => s.transactions);
  const currency = useSettingsStore((s) => s.settings.currency);

  const now = new Date();
  const prevMonthDate = subMonths(now, 1);

  // Current month transactions vs previous month
  const currentMonthTx = transactions.filter((t) => {
    try {
      return isSameMonth(parseISO(t.date), now);
    } catch {
      return false;
    }
  });

  const prevMonthTx = transactions.filter((t) => {
    try {
      return isSameMonth(parseISO(t.date), prevMonthDate);
    } catch {
      return false;
    }
  });

  // Totals
  const totalBalance = calculateBalance(transactions);
  const currentIncome = calculateIncome(currentMonthTx);
  const prevIncome = calculateIncome(prevMonthTx);
  const incomeChange = calculatePercentageChange(currentIncome, prevIncome);

  const currentExpense = calculateExpenses(currentMonthTx);
  const prevExpense = calculateExpenses(prevMonthTx);
  const expenseChange = calculatePercentageChange(currentExpense, prevExpense);

  const currentSavings = currentIncome - currentExpense;
  const savingsRate = calculateSavingsRate(currentMonthTx);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      {/* Total Balance */}
      <StatCard
        title="Total Balance"
        amount={formatCurrency(totalBalance, currency)}
        icon={Wallet}
        variant="brand"
        comparisonText="Across all active accounts"
      />

      {/* Total Income */}
      <StatCard
        title="Total Income (This Month)"
        amount={formatCurrency(currentIncome, currency)}
        change={incomeChange}
        comparisonText="vs last month"
        icon={TrendingUp}
        variant="success"
      />

      {/* Total Expenses */}
      <StatCard
        title="Total Expenses (This Month)"
        amount={formatCurrency(currentExpense, currency)}
        change={expenseChange}
        comparisonText="vs last month"
        icon={TrendingDown}
        variant="danger"
      />

      {/* Savings & Rate */}
      <StatCard
        title="Net Savings (This Month)"
        amount={formatCurrency(currentSavings, currency)}
        subtitle={`${savingsRate}% savings rate`}
        icon={PiggyBank}
        variant="info"
      />
    </div>
  );
};
