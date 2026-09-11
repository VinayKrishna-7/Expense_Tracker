import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-400 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          <select
            ref={ref}
            id={selectId}
            className={twMerge(
              clsx(
                'block w-full appearance-none rounded-lg border text-sm transition-colors duration-150',
                'bg-white dark:bg-surface-900',
                'text-surface-900 dark:text-surface-100',
                'border-surface-200 dark:border-surface-700 focus:border-brand-500 dark:focus:border-brand-500',
                'focus:outline-none focus:ring-2 focus:ring-brand-500/20',
                'disabled:bg-surface-100 dark:disabled:bg-surface-800 disabled:cursor-not-allowed',
                'pl-3.5 pr-10 py-2',
                error && 'border-rose-500 focus:border-rose-500 text-rose-900 dark:text-rose-100',
                className
              )
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-surface-400">
            <ChevronDown size={16} />
          </div>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
