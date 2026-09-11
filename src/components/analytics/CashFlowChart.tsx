import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import { subMonths, format, parseISO, isSameMonth } from 'date-fns';

export const CashFlowChart: React.FC = () => {
  const transactions = useTransactionStore((s) => s.transactions);
  const currency = useSettingsStore((s) => s.settings.currency);

  const cashFlowData = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i);
      const label = format(m, 'MMM yyyy');

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

      const expenses = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netSavings = income - expenses;

      months.push({
        name: label,
        income,
        expenses,
        netSavings,
      });
    }

    return months;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800 shadow-modal text-xs space-y-1.5">
          <p className="font-bold text-surface-900 dark:text-white pb-1 border-b border-surface-100 dark:border-surface-800">
            {label}
          </p>
          <div className="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
            <span>Income:</span>
            <span>{formatCurrency(payload[0]?.value || 0, currency)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-500 font-semibold">
            <span>Expenses:</span>
            <span>{formatCurrency(payload[1]?.value || 0, currency)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-brand-600 font-bold border-t border-surface-100 dark:border-surface-800 pt-1">
            <span>Net Savings:</span>
            <span>{formatCurrency(payload[2]?.value || 0, currency)}</span>
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
            Cash Flow & Net Savings
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Income vs Expenses vs Net Savings trajectory
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4 pb-2">
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cashFlowData}
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
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10b981"
                fill="#10b98120"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#f43f5e"
                fill="#f43f5e20"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="netSavings"
                name="Net Savings"
                stroke="#6366f1"
                fill="#6366f120"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
