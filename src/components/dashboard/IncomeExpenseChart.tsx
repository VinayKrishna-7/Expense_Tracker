import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
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
import {
  subDays,
  subMonths,
  format,
  parseISO,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { clsx } from 'clsx';

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

export const IncomeExpenseChart: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const transactions = useTransactionStore((s) => s.transactions);
  const currency = useSettingsStore((s) => s.settings.currency);

  const chartData = useMemo(() => {
    const now = new Date();

    if (period === 'weekly') {
      // Last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(now, i);
        const dayLabel = format(d, 'EEE d');
        const dayTx = transactions.filter((t) => {
          try {
            return isSameDay(parseISO(t.date), d);
          } catch {
            return false;
          }
        });

        const income = dayTx
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = dayTx
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        days.push({ name: dayLabel, income, expense });
      }
      return days;
    }

    if (period === 'monthly') {
      // Last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const m = subMonths(now, i);
        const monthLabel = format(m, 'MMM yyyy');
        const monthTx = transactions.filter((t) => {
          try {
            return isSameMonth(parseISO(t.date), m);
          } catch {
            return false;
          }
        });

        const income = monthTx
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTx
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        months.push({ name: monthLabel, income, expense });
      }
      return months;
    }

    // Yearly
    const years = ['2024', '2025', '2026'];
    return years.map((yr) => {
      const yrTx = transactions.filter((t) => t.date.startsWith(yr));
      const income = yrTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = yrTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: yr, income, expense };
    });
  }, [period, transactions]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800 shadow-modal text-xs space-y-1.5 min-w-[140px]">
          <p className="font-bold text-surface-900 dark:text-white pb-1 border-b border-surface-100 dark:border-surface-800">
            {label}
          </p>
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Income:</span>
            <span>{formatCurrency(payload[0]?.value || 0, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-rose-500 font-semibold">
            <span>Expense:</span>
            <span>{formatCurrency(payload[1]?.value || 0, currency)}</span>
          </div>
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
            Income vs Expenses
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Cashflow comparison across periods
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center p-1 bg-surface-100 dark:bg-surface-800 rounded-lg text-xs font-semibold">
          {(['weekly', 'monthly', 'yearly'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={clsx(
                'px-2.5 py-1 rounded-md capitalize transition-all',
                period === p
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-2">
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

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

              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#incomeGrad)"
              />

              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
