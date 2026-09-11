import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import { subDays, format, parseISO, isSameDay } from 'date-fns';

export const SpendingTrendChart: React.FC = () => {
  const transactions = useTransactionStore((s) => s.transactions);
  const currency = useSettingsStore((s) => s.settings.currency);

  const trendData = useMemo(() => {
    const now = new Date();
    const days = [];

    for (let i = 13; i >= 0; i--) {
      const d = subDays(now, i);
      const dayLabel = format(d, 'MMM d');

      const dayExpenses = transactions
        .filter((t) => {
          try {
            return t.type === 'expense' && isSameDay(parseISO(t.date), d);
          } catch {
            return false;
          }
        })
        .reduce((sum, t) => sum + t.amount, 0);

      days.push({
        date: dayLabel,
        amount: dayExpenses,
      });
    }

    return days;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-surface-900 p-2.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-modal text-xs">
          <p className="font-bold text-surface-900 dark:text-white mb-1">
            {label}
          </p>
          <p className="font-semibold text-brand-600 dark:text-brand-400">
            {formatCurrency(payload[0]?.value || 0, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-surface-900 dark:text-white">
            Daily Spending Trend
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Expense velocity over past 14 days
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-2">
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#88888820"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#888888' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#888888' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  formatCurrency(val, currency, { compact: true })
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
