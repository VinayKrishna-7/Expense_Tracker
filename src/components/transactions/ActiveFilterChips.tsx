import React from 'react';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import { X } from 'lucide-react';

export const ActiveFilterChips: React.FC = () => {
  const filters = useTransactionStore((s) => s.filters);
  const setFilters = useTransactionStore((s) => s.setFilters);
  const resetFilters = useTransactionStore((s) => s.resetFilters);
  const categories = useCategoryStore((s) => s.categories);
  const currency = useSettingsStore((s) => s.settings.currency);

  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    chips.push({
      label: `Search: "${filters.search}"`,
      onRemove: () => setFilters({ search: '' }),
    });
  }

  if (filters.type && filters.type !== 'all') {
    chips.push({
      label: `Type: ${filters.type.toUpperCase()}`,
      onRemove: () => setFilters({ type: 'all' }),
    });
  }

  if (filters.category && filters.category !== 'all') {
    const cat = categories.find((c) => c.id === filters.category);
    chips.push({
      label: `Category: ${cat?.name || filters.category}`,
      onRemove: () => setFilters({ category: 'all' }),
    });
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    chips.push({
      label: `Method: ${filters.paymentMethod}`,
      onRemove: () => setFilters({ paymentMethod: 'all' }),
    });
  }

  if (filters.startDate) {
    chips.push({
      label: `From: ${filters.startDate}`,
      onRemove: () => setFilters({ startDate: '' }),
    });
  }

  if (filters.endDate) {
    chips.push({
      label: `To: ${filters.endDate}`,
      onRemove: () => setFilters({ endDate: '' }),
    });
  }

  if (filters.minAmount !== undefined) {
    chips.push({
      label: `Min: ${formatCurrency(filters.minAmount, currency)}`,
      onRemove: () => setFilters({ minAmount: undefined }),
    });
  }

  if (filters.maxAmount !== undefined) {
    chips.push({
      label: `Max: ${formatCurrency(filters.maxAmount, currency)}`,
      onRemove: () => setFilters({ maxAmount: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4 animate-fade-in">
      <span className="text-xs font-semibold text-surface-400">
        Active Filters:
      </span>
      {chips.map((chip, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50 shadow-subtle"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="p-0.5 hover:bg-brand-200 dark:hover:bg-brand-800 rounded-full transition-colors"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={resetFilters}
        className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 ml-1 transition-colors underline"
      >
        Clear all
      </button>
    </div>
  );
};
