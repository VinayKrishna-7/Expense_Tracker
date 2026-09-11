import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  value: number; // 0 to 100+
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'auto',
  size = 'md',
  showLabel = false,
  className,
}) => {
  const percentage = Math.max(0, (value / max) * 100);
  const clampedPercentage = Math.min(100, percentage);

  let barColor = 'bg-brand-500';
  if (variant === 'auto') {
    if (percentage >= 100) {
      barColor = 'bg-rose-500';
    } else if (percentage >= 80) {
      barColor = 'bg-amber-500';
    } else {
      barColor = 'bg-emerald-500';
    }
  } else {
    const colorMap = {
      primary: 'bg-brand-500',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-rose-500',
    };
    barColor = colorMap[variant];
  }

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={twMerge('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
          <span>Progress</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div
        className={clsx(
          'w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden',
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            barColor
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};
