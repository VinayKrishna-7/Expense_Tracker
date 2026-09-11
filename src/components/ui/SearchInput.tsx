import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  showShortcut?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search transactions...',
      showShortcut = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx('relative flex items-center w-full', className)}>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
          <Search size={16} />
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-12 py-2 text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-lg text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          {...props}
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                onClear?.();
              }}
              aria-label="Clear search"
              className="p-1 rounded-md text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <X size={14} />
            </button>
          ) : showShortcut ? (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-surface-400 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded">
              /
            </kbd>
          ) : null}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
