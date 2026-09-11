import React from 'react';
import { Transaction } from '../../types/transaction';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency, formatSmartDate } from '../../utils/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { MoreVertical, Eye, Edit3, Copy, Trash2, Repeat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onDuplicate: (tx: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const navigate = useNavigate();
  const categories = useCategoryStore((s) => s.categories);
  const currency = useSettingsStore((s) => s.settings.currency);

  const category = categories.find((c) => c.id === transaction.category);
  const isExpense = transaction.type === 'expense';

  const menuItems: DropdownItem[] = [
    {
      label: 'View Details',
      icon: <Eye size={15} />,
      onClick: () => navigate(`/transactions/${transaction.id}`),
    },
    {
      label: 'Edit Record',
      icon: <Edit3 size={15} />,
      onClick: () => onEdit(transaction),
    },
    {
      label: 'Duplicate',
      icon: <Copy size={15} />,
      onClick: () => onDuplicate(transaction),
    },
    {
      label: 'Delete Record',
      icon: <Trash2 size={15} />,
      variant: 'danger',
      onClick: () => onDelete(transaction),
    },
  ];

  return (
    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-surface-200/70 dark:border-surface-800/70 bg-white dark:bg-surface-900 hover:border-surface-300 dark:hover:border-surface-700 transition-all shadow-subtle group">
      {/* Category Icon & Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${category?.color || '#6366f1'}15`,
            color: category?.color || '#6366f1',
          }}
        >
          <CategoryIcon name={category?.icon} size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              onClick={() => navigate(`/transactions/${transaction.id}`)}
              className="text-xs sm:text-sm font-bold text-surface-900 dark:text-surface-100 truncate cursor-pointer hover:text-brand-600 transition-colors"
            >
              {transaction.title}
            </span>
            {transaction.isRecurring && (
              <span
                title={`Recurring: ${transaction.recurringFrequency || 'Monthly'}`}
                className="p-0.5 rounded text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60"
              >
                <Repeat size={12} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-surface-400">
            <span>{category?.name || 'Uncategorized'}</span>
            <span>•</span>
            <span>{formatSmartDate(transaction.date)}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{transaction.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <div className="text-right">
          <span
            className={clsx(
              'text-xs sm:text-sm font-black tracking-tight',
              isExpense
                ? 'text-surface-900 dark:text-white'
                : 'text-emerald-600 dark:text-emerald-400'
            )}
          >
            {isExpense ? '-' : '+'}
            {formatCurrency(transaction.amount, currency)}
          </span>
          <p className="text-[10px] text-surface-400 sm:hidden">
            {transaction.paymentMethod}
          </p>
        </div>

        <Dropdown
          trigger={
            <button
              type="button"
              className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
          }
          items={menuItems}
        />
      </div>
    </div>
  );
};
