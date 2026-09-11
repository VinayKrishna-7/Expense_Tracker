import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import { parseISO, subMonths, isSameMonth } from 'date-fns';

export const MonthlyComparisonChart: React.FC = () => {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const currency = useSettingsStore((s) => s.settings.currency);

  const comparisonData = useMemo(() => {
    const now = new Date();
    const prevDate = subMonths(now, 1);

    const currentMonthTx = transactions.filter((t) => {
      try {
        return t.type === 'expense' && isSameMonth(parseISO(t.date), now);
      } catch {
        return false;
      }
    });

    const prevMonthTx = transactions.filter((t) => {
      try {
        return t.type === 'expense' && isSameMonth(parseISO(t.date), prevDate);
      } catch {
        return false;
      }
    });

    const expenseCategories = categories.filter((c) => c.type === 'expense');

    return expenseCategories
      .map((cat) => {
        const currentAmount = currentMonthTx
          .filter((t) => t.category === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);

        const prevAmount = prevMonthTx
          .filter((t) => t.category === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          name: cat.name.split('&')[0].trim(),
          currentMonth: currentAmount,
          previousMonth: prevAmount,
        };
      })
      .filter((item) => item.currentMonth > 0 || item.previousMonth > 0)
      .slice(0, 6);
  }, [transactions, categories]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800 shadow-modal text-xs space-y-1">
          <p className="font-bold text-surface-900 dark:text-white pb-1 border-b border-surface-100 dark:border-surface-800">
            {label}
          </p>
          <div className="flex items-center justify-between gap-3 text-brand-600 font-semibold">
            <span>This Month:</span>
            <span>{formatCurrency(payload[0]?.value || 0, currency)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-surface-400 font-semibold">
            <span>Last Month:</span>
            <span>{formatCurrency(payload[1]?.value || 0, currency)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-surface-900 dark:text-white">
            Current vs Previous Month
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Category-wise side-by-side comparison
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-2">
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#88888820"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#888888' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#888888' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  formatCurrency(val, currency, { compact: true })
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              />
              <Bar
                dataKey="currentMonth"
                name="Current Month"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="previousMonth"
                name="Previous Month"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
