import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface CategoryAnalysisItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  momChange: number; // Month over month % change
}

interface CategoryBreakdownTableProps {
  categories: CategoryAnalysisItem[];
}

export const CategoryBreakdownTable: React.FC<CategoryBreakdownTableProps> = ({
  categories,
}) => {
  const currency = useSettingsStore((s) => s.settings.currency);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-surface-900 dark:text-white">
            Category Breakdown & MoM Shift
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Spending distribution and velocity changes vs prior month
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800/80 bg-surface-50/50 dark:bg-surface-900/50 text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">% of Total</th>
                <th className="py-3 px-4 text-right">MoM Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800/60">
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${cat.color}15`,
                          color: cat.color,
                        }}
                      >
                        <CategoryIcon name={cat.icon} size={14} />
                      </div>
                      <span className="font-bold text-surface-900 dark:text-surface-100">
                        {cat.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-black text-surface-900 dark:text-white">
                    {formatCurrency(cat.amount, currency)}
                  </td>

                  <td className="py-3 px-4 text-right font-semibold text-surface-600 dark:text-surface-300">
                    {cat.percentage}%
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full',
                        cat.momChange > 0
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : cat.momChange < 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                      )}
                    >
                      {cat.momChange > 0 ? (
                        <TrendingUp size={11} />
                      ) : cat.momChange < 0 ? (
                        <TrendingDown size={11} />
                      ) : null}
                      {cat.momChange > 0 ? `+${cat.momChange}%` : `${cat.momChange}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
