import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white dark:bg-surface-900 rounded-xl transition-all duration-200',
          bordered && 'border border-surface-200/80 dark:border-surface-800/80',
          'shadow-card',
          hoverable && 'hover:shadow-card-hover hover:border-surface-300 dark:hover:border-surface-700',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'p-5 sm:p-6 pb-3 border-b border-surface-100 dark:border-surface-800/60 flex items-center justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={twMerge('p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'px-5 sm:px-6 py-3.5 border-t border-surface-100 dark:border-surface-800/60 bg-surface-50/50 dark:bg-surface-900/50 rounded-b-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
