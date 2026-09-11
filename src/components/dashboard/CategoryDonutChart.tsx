import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import { calculateCategoryTotals } from '../../utils/calculations';
import { useNavigate } from 'react-router-dom';
import { parseISO, isSameMonth } from 'date-fns';

export const CategoryDonutChart: React.FC = () => {
  const navigate = useNavigate();
  const transactions = useTransactionStore((s) => s.transactions);
  const setFilters = useTransactionStore((s) => s.setFilters);
  const categories = useCategoryStore((s) => s.categories);
  const currency = useSettingsStore((s) => s.settings.currency);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Filter current month transactions
  const currentMonthTx = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      try {
        return isSameMonth(parseISO(t.date), now);
      } catch {
        return false;
      }
    });
  }, [transactions]);

  const { data, totalExpense } = useMemo(() => {
    const totals = calculateCategoryTotals(currentMonthTx);
    let total = 0;

    const list = Object.entries(totals)
      .map(([catId, amount]) => {
        total += amount;
        const cat = categoryMap.get(catId);
        return {
          id: catId,
          name: cat?.name || 'Other',
          color: cat?.color || '#64748b',
          value: amount,
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Calculate percentages
    const withPercentages = list.map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0,
    }));

    return { data: withPercentages, totalExpense: total };
  }, [currentMonthTx, categoryMap]);

  const handleCategoryClick = (categoryId: string) => {
    setFilters({ category: categoryId, type: 'expense' });
    navigate('/transactions');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-surface-900 p-2.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-modal text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-bold text-surface-900 dark:text-white">
              {item.name}
            </span>
          </div>
          <p className="font-semibold text-surface-700 dark:text-surface-200">
            {formatCurrency(item.value, currency)} ({item.percentage}%)
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
            Expenses by Category
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            September spending distribution
          </p>
        </div>
        <span className="text-xs font-bold text-surface-700 dark:text-surface-300">
          {formatCurrency(totalExpense, currency)}
        </span>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-surface-400">
            No expenses recorded this month yet.
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    cursor="pointer"
                    onClick={(entry) => handleCategoryClick(entry.id)}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-surface-400">
                  Total
                </span>
                <span className="text-xs font-black text-surface-900 dark:text-white">
                  {formatCurrency(totalExpense, currency, { compact: true })}
                </span>
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-2 mt-3 pt-3 border-t border-surface-100 dark:border-surface-800 max-h-44 overflow-y-auto pr-1">
              {data.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCategoryClick(item.id)}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-surface-700 dark:text-surface-300 font-medium truncate group-hover:text-brand-600 transition-colors">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-surface-400 text-[11px]">
                      {item.percentage}%
                    </span>
                    <span className="font-bold text-surface-900 dark:text-white">
                      {formatCurrency(item.value, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
