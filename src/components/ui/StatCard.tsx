import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  amount: string;
  change?: number; // percentage change e.g. 8.4 or -3.8
  comparisonText?: string;
  icon: LucideIcon;
  variant?: 'brand' | 'success' | 'danger' | 'info';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  change,
  comparisonText,
  icon: Icon,
  variant = 'brand',
  subtitle,
}) => {
  const iconBgVariants = {
    brand: 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50',
    danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50',
    info: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50',
  };

  const isPositive = change !== undefined ? change >= 0 : undefined;

  return (
    <Card hoverable className="p-5 sm:p-6 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
          {title}
        </span>
        <div className={clsx('p-2.5 rounded-xl shrink-0', iconBgVariants[variant])}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
          {amount}
        </div>

        {(change !== undefined || comparisonText || subtitle) && (
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {change !== undefined && (
              <span
                className={clsx(
                  'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                  isPositive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                )}
              >
                {isPositive ? (
                  <TrendingUp size={13} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={13} strokeWidth={2.5} />
                )}
                {isPositive ? `+${change}%` : `${change}%`}
              </span>
            )}
            {comparisonText && (
              <span className="text-xs text-surface-500 dark:text-surface-400">
                {comparisonText}
              </span>
            )}
            {subtitle && (
              <span className="text-xs font-medium text-surface-600 dark:text-surface-300">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
