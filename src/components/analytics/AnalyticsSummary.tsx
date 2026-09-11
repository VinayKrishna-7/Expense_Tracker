import React from 'react';
import { Card } from '../ui/Card';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import {
  DollarSign,
  Calendar,
  Zap,
  TrendingDown,
} from 'lucide-react';

interface AnalyticsSummaryProps {
  totalSpending: number;
  avgDailySpending: number;
  highestSpendingDay: { date: string; amount: number } | null;
  largestCategory: { name: string; amount: number; percentage: number } | null;
  periodLabel: string;
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  totalSpending,
  avgDailySpending,
  highestSpendingDay,
  largestCategory,
  periodLabel,
}) => {
  const currency = useSettingsStore((s) => s.settings.currency);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Spending */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Total Spending
          </span>
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-surface-900 dark:text-white">
            {formatCurrency(totalSpending, currency)}
          </p>
          <p className="text-xs text-surface-400 mt-1">{periodLabel}</p>
        </div>
      </Card>

      {/* Avg Daily Spending */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Daily Average
          </span>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Calendar size={18} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-surface-900 dark:text-white">
            {formatCurrency(avgDailySpending, currency)}
          </p>
          <p className="text-xs text-surface-400 mt-1">Per day spending rate</p>
        </div>
      </Card>

      {/* Highest Spending Day */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Peak Spending Day
          </span>
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Zap size={18} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-surface-900 dark:text-white">
            {highestSpendingDay
              ? formatCurrency(highestSpendingDay.amount, currency)
              : '₹0'}
          </p>
          <p className="text-xs text-surface-400 mt-1">
            {highestSpendingDay ? highestSpendingDay.date : 'No expenses yet'}
          </p>
        </div>
      </Card>

      {/* Largest Category */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            Top Category
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <TrendingDown size={18} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-surface-900 dark:text-white truncate">
            {largestCategory ? largestCategory.name : 'N/A'}
          </p>
          <p className="text-xs text-surface-400 mt-1">
            {largestCategory
              ? `${formatCurrency(largestCategory.amount, currency)} (${largestCategory.percentage}%)`
              : 'No expenses'}
          </p>
        </div>
      </Card>
    </div>
  );
};
