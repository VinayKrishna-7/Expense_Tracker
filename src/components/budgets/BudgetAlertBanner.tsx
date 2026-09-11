import React from 'react';
import { BudgetProgress } from '../../types/budget';
import { useCategoryStore } from '../../store/useCategoryStore';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface BudgetAlertBannerProps {
  progressList: BudgetProgress[];
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({
  progressList,
}) => {
  const categories = useCategoryStore((s) => s.categories);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Find budgets with warnings (>= 75%) or danger (>= 100%)
  const alerts = progressList
    .filter((p) => p.percentage >= 75)
    .sort((a, b) => b.percentage - a.percentage);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2.5 mb-6">
      {alerts.map((item) => {
        const catName =
          categories.find(
            (c) =>
              c.id === item.budget.category ||
              c.name.toLowerCase() === (item.budget.category || '').toLowerCase()
          )?.name || item.budget.category || 'Category';
        const isExceeded = item.percentage >= 100;
        const isNearLimit = item.percentage >= 90;

        return (
          <div
            key={item.budget.id}
            className={clsx(
              'flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium animate-slide-down',
              isExceeded
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                : isNearLimit
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
                : 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200'
            )}
          >
            {isExceeded ? (
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
            ) : (
              <AlertTriangle size={20} className="text-amber-600 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <span className="font-bold">
                {isExceeded ? '⚠️ Budget Limit Exceeded: ' : '⚡ Budget Alert: '}
              </span>
              <span>
                You have used <strong>{item.percentage}%</strong> of your{' '}
                <strong>{catName}</strong> budget for this month.
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
