import React from 'react';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { TransactionType, PaymentMethod } from '../../types/transaction';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen }) => {
  const filters = useTransactionStore((s) => s.filters);
  const setFilters = useTransactionStore((s) => s.setFilters);
  const resetFilters = useTransactionStore((s) => s.resetFilters);
  const categories = useCategoryStore((s) => s.categories);

  if (!isOpen) return null;

  const paymentMethods: PaymentMethod[] = [
    'UPI',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Cash',
    'Wallet',
    'Other',
  ];

  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm mb-4 space-y-4 animate-slide-down">
      <div className="flex items-center justify-between pb-2 border-b border-surface-100 dark:border-surface-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-surface-700 dark:text-surface-300">
          Filter Transactions
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          leftIcon={<RotateCcw size={13} />}
          className="text-xs"
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Transaction Type */}
        <Select
          label="Type"
          value={filters.type || 'all'}
          onChange={(e) =>
            setFilters({ type: e.target.value as TransactionType | 'all' })
          }
        >
          <option value="all">All Types</option>
          <option value="expense">Expense Only</option>
          <option value="income">Income Only</option>
        </Select>

        {/* Category */}
        <Select
          label="Category"
          value={filters.category || 'all'}
          onChange={(e) => setFilters({ category: e.target.value })}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        {/* Payment Method */}
        <Select
          label="Payment Method"
          value={filters.paymentMethod || 'all'}
          onChange={(e) =>
            setFilters({
              paymentMethod: e.target.value as PaymentMethod | 'all',
            })
          }
        >
          <option value="all">All Methods</option>
          {paymentMethods.map((pm) => (
            <option key={pm} value={pm}>
              {pm}
            </option>
          ))}
        </Select>

        {/* Start Date */}
        <Input
          label="From Date"
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => setFilters({ startDate: e.target.value })}
        />

        {/* End Date */}
        <Input
          label="To Date"
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => setFilters({ endDate: e.target.value })}
        />
      </div>

      {/* Amount Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-surface-100 dark:border-surface-800">
        <Input
          label="Min Amount"
          type="number"
          placeholder="Min ₹"
          value={filters.minAmount !== undefined ? filters.minAmount : ''}
          onChange={(e) =>
            setFilters({
              minAmount: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
        <Input
          label="Max Amount"
          type="number"
          placeholder="Max ₹"
          value={filters.maxAmount !== undefined ? filters.maxAmount : ''}
          onChange={(e) =>
            setFilters({
              maxAmount: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>
    </div>
  );
};
