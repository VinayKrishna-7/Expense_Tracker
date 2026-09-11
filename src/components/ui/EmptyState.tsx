import React from 'react';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-800 bg-surface-50/40 dark:bg-surface-900/40">
      <div className="p-3.5 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 mb-4 ring-8 ring-surface-50 dark:ring-surface-900">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400 max-w-sm">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex items-center gap-3">
          {secondaryActionLabel && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
