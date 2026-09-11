import React, { useState, useMemo } from 'react';
import { useTransactionStore } from '../store/useTransactionStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { AnalyticsSummary } from '../components/analytics/AnalyticsSummary';
import { CategoryBreakdownTable, CategoryAnalysisItem } from '../components/analytics/CategoryBreakdownTable';
import { MonthlyComparisonChart } from '../components/analytics/MonthlyComparisonChart';
import { CashFlowChart } from '../components/analytics/CashFlowChart';
import {
  calculateExpenses,
  calculateCategoryTotals,
  calculatePercentageChange,
} from '../utils/calculations';
import {
  parseISO,
  isSameMonth,
  subMonths,
  subDays,
  isAfter,
  startOfWeek,
  startOfYear,
  differenceInDays,
  format,
} from 'date-fns';
import { clsx } from 'clsx';

type AnalyticsRange =
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'last_3m'
  | 'last_6m'
  | 'this_year'
  | 'all_time';

export const AnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<AnalyticsRange>('this_month');
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Filter transactions according to selected range
  const { filteredTx, periodLabel, daysCount } = useMemo(() => {
    const now = new Date();

    if (range === 'this_week') {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const txs = transactions.filter((t) => {
        try {
          return isAfter(parseISO(t.date), weekStart);
        } catch {
          return false;
        }
      });
      return {
        filteredTx: txs,
        periodLabel: 'Current Week',
        daysCount: 7,
      };
    }

    if (range === 'this_month') {
      const txs = transactions.filter((t) => {
        try {
          return isSameMonth(parseISO(t.date), now);
        } catch {
          return false;
        }
      });
      return {
        filteredTx: txs,
        periodLabel: 'September 2026',
        daysCount: now.getDate() || 11,
      };
    }

    if (range === 'last_month') {
      const lastMonthDate = subMonths(now, 1);
      const txs = transactions.filter((t) => {
        try {
          return isSameMonth(parseISO(t.date), lastMonthDate);
        } catch {
          return false;
        }
      });
      return {
        filteredTx: txs,
        periodLabel: 'August 2026',
        daysCount: 31,
      };
    }

    if (range === 'last_3m') {
      const threeMonthsAgo = subMonths(now, 3);
      const txs = transactions.filter((t) => {
        try {
          return isAfter(parseISO(t.date), threeMonthsAgo);
        } catch {
          return false;
        }
      });
      return {
        filteredTx: txs,
        periodLabel: 'Last 3 Months',
        daysCount: 90,
      };
    }

    if (range === 'last_6m') {
      const sixMonthsAgo = subMonths(now, 6);
      const txs = transactions.filter((t) => {
        try {
          return isAfter(parseISO(t.date), sixMonthsAgo);
        } catch {
          return false;
        }
      });
      return {
        filteredTx: txs,
        periodLabel: 'Last 6 Months',
        daysCount: 180,
      };
    }

    if (range === 'this_year') {
      const yearStart = startOfYear(now);
      const txs = transactions.filter((t) => {
        try {
          return isAfter(parseISO(t.date), yearStart);
        } catch {
          return false;
        }
      });
      return {
        filteredTx: txs,
        periodLabel: 'Year 2026',
        daysCount: differenceInDays(now, yearStart) || 250,
      };
    }

    // all_time
    return {
      filteredTx: transactions,
      periodLabel: 'All Historical Records',
      daysCount: 365,
    };
  }, [range, transactions]);

  // Aggregate Metrics
  const totalSpending = useMemo(
    () => calculateExpenses(filteredTx),
    [filteredTx]
  );

  const avgDailySpending = useMemo(() => {
    return Math.round(totalSpending / Math.max(1, daysCount));
  }, [totalSpending, daysCount]);

  // Peak spending day
  const highestSpendingDay = useMemo(() => {
    const dayTotals: Record<string, number> = {};
    for (const t of filteredTx) {
      if (t.type === 'expense') {
        dayTotals[t.date] = (dayTotals[t.date] || 0) + t.amount;
      }
    }
    let maxDate = '';
    let maxAmount = 0;
    for (const [date, amount] of Object.entries(dayTotals)) {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxDate = date;
      }
    }
    return maxAmount > 0
      ? {
          date: format(parseISO(maxDate), 'MMM d, yyyy'),
          amount: maxAmount,
        }
      : null;
  }, [filteredTx]);

  // Category Analysis & Largest Category
  const { categoryAnalysisList, largestCategory } = useMemo(() => {
    const now = new Date();
    const prevMonthDate = subMonths(now, 1);
    const prevMonthTx = transactions.filter((t) => {
      try {
        return isSameMonth(parseISO(t.date), prevMonthDate);
      } catch {
        return false;
      }
    });

    const currentTotals = calculateCategoryTotals(filteredTx);
    const prevTotals = calculateCategoryTotals(prevMonthTx);

    const list: CategoryAnalysisItem[] = Object.entries(currentTotals)
      .map(([catId, amount]) => {
        const cat = categoryMap.get(catId);
        const prevAmount = prevTotals[catId] || 0;
        const momChange = calculatePercentageChange(amount, prevAmount);
        const percentage =
          totalSpending > 0
            ? Math.round((amount / totalSpending) * 1000) / 10
            : 0;

        return {
          id: catId,
          name: cat?.name || 'Other',
          icon: cat?.icon || 'Tag',
          color: cat?.color || '#64748b',
          amount,
          percentage,
          momChange,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const largest =
      list.length > 0
        ? {
            name: list[0].name,
            amount: list[0].amount,
            percentage: list[0].percentage,
          }
        : null;

    return { categoryAnalysisList: list, largestCategory: largest };
  }, [filteredTx, transactions, categoryMap, totalSpending]);

  const rangeButtons: { value: AnalyticsRange; label: string }[] = [
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3m', label: 'Last 3M' },
    { value: 'last_6m', label: 'Last 6M' },
    { value: 'this_year', label: 'This Year' },
    { value: 'all_time', label: 'All Time' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Range Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Financial Analytics
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Deep dive into your spending trends, cash flows, and category distributions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl overflow-x-auto text-xs font-semibold">
          {rangeButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => setRange(btn.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg whitespace-nowrap transition-all',
                range === btn.value
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <AnalyticsSummary
        totalSpending={totalSpending}
        avgDailySpending={avgDailySpending}
        highestSpendingDay={highestSpendingDay}
        largestCategory={largestCategory}
        periodLabel={periodLabel}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart />
        <MonthlyComparisonChart />
      </div>

      {/* Category Breakdown Table */}
      <CategoryBreakdownTable categories={categoryAnalysisList} />
    </div>
  );
};
