import React from 'react';
import { Transaction } from '../../types/transaction';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Badge } from '../ui/Badge';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import {
  MoreHorizontal,
  Eye,
  Edit3,
  Copy,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Repeat,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface TransactionTableProps {
  transactions: Transaction[];
  totalCount: number;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onDuplicate: (tx: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  totalCount,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const navigate = useNavigate();
  const categories = useCategoryStore((s) => s.categories);
  const currency = useSettingsStore((s) => s.settings.currency);
  const { sort, setSort, page, setPage, pageSize, setPageSize } =
    useTransactionStore();

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handleSort = (field: 'date' | 'amount' | 'title') => {
    if (sort.field === field) {
      setSort({
        field,
        order: sort.order === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSort({ field, order: 'desc' });
    }
  };

  const renderSortIcon = (field: 'date' | 'amount' | 'title') => {
    if (sort.field !== field) {
      return <ArrowUpDown size={12} className="opacity-40" />;
    }
    return sort.order === 'asc' ? (
      <ArrowUp size={12} className="text-brand-500" />
    ) : (
      <ArrowDown size={12} className="text-brand-500" />
    );
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/80 dark:border-surface-800/80 shadow-card overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-100 dark:border-surface-800/80 bg-surface-50/50 dark:bg-surface-900/50 text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
              <th
                className="py-3.5 px-4 cursor-pointer select-none hover:text-surface-900 dark:hover:text-white"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  {renderSortIcon('date')}
                </div>
              </th>

              <th
                className="py-3.5 px-4 cursor-pointer select-none hover:text-surface-900 dark:hover:text-white"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Description</span>
                  {renderSortIcon('title')}
                </div>
              </th>

              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Payment Method</th>
              <th className="py-3.5 px-4">Type</th>

              <th
                className="py-3.5 px-4 text-right cursor-pointer select-none hover:text-surface-900 dark:hover:text-white"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </div>
              </th>

              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-100 dark:divide-surface-800/60 text-xs">
            {transactions.map((tx) => {
              const cat = categoryMap.get(tx.category);
              const isExpense = tx.type === 'expense';

              const menuItems: DropdownItem[] = [
                {
                  label: 'View Details',
                  icon: <Eye size={14} />,
                  onClick: () => navigate(`/transactions/${tx.id}`),
                },
                {
                  label: 'Edit Record',
                  icon: <Edit3 size={14} />,
                  onClick: () => onEdit(tx),
                },
                {
                  label: 'Duplicate',
                  icon: <Copy size={14} />,
                  onClick: () => onDuplicate(tx),
                },
                {
                  label: 'Delete Record',
                  icon: <Trash2 size={14} />,
                  variant: 'danger',
                  onClick: () => onDelete(tx),
                },
              ];

              return (
                <tr
                  key={tx.id}
                  className="hover:bg-surface-50/70 dark:hover:bg-surface-800/40 transition-colors group"
                >
                  {/* Date */}
                  <td className="py-3.5 px-4 font-medium text-surface-600 dark:text-surface-300 whitespace-nowrap">
                    {formatDate(tx.date, 'MMM d, yyyy')}
                  </td>

                  {/* Description / Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 max-w-xs">
                      <span
                        onClick={() => navigate(`/transactions/${tx.id}`)}
                        className="font-bold text-surface-900 dark:text-surface-100 hover:text-brand-600 transition-colors cursor-pointer truncate"
                      >
                        {tx.title}
                      </span>
                      {tx.isRecurring && (
                        <span
                          title={`Recurring: ${tx.recurringFrequency || 'Monthly'}`}
                          className="p-0.5 rounded text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60"
                        >
                          <Repeat size={12} />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
                      <span
                        style={{ color: cat?.color || '#6366f1' }}
                        className="shrink-0"
                      >
                        <CategoryIcon name={cat?.icon} size={14} />
                      </span>
                      <span>{cat?.name || 'Uncategorized'}</span>
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-surface-600 dark:text-surface-300">
                    <span className="px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[11px] font-medium">
                      {tx.paymentMethod}
                    </span>
                  </td>

                  {/* Type Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant={isExpense ? 'danger' : 'success'}
                      size="sm"
                    >
                      {isExpense ? 'Expense' : 'Income'}
                    </Badge>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={clsx(
                        'font-black text-sm tracking-tight',
                        isExpense
                          ? 'text-surface-900 dark:text-white'
                          : 'text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <Dropdown
                      trigger={
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      }
                      items={menuItems}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="px-4 py-3.5 border-t border-surface-100 dark:border-surface-800 bg-surface-50/30 dark:bg-surface-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-surface-500 dark:text-surface-400">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 text-surface-800 dark:text-surface-200"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>per page • Total {totalCount} records</span>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-2.5 py-1 rounded-md border border-surface-200 dark:border-surface-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            Previous
          </button>
          <span className="px-2 font-semibold text-surface-800 dark:text-surface-200">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2.5 py-1 rounded-md border border-surface-200 dark:border-surface-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
