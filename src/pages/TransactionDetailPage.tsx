import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../store/useTransactionStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useToastStore } from '../store/useToastStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';
import { DeleteConfirmModal } from '../components/transactions/DeleteConfirmModal';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Edit3,
  Copy,
  Trash2,
  Clock,
  FileText,
  Repeat,
} from 'lucide-react';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const transactions = useTransactionStore((s) => s.transactions);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const undoDelete = useTransactionStore((s) => s.undoDelete);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const categories = useCategoryStore((s) => s.categories);
  const currency = useSettingsStore((s) => s.settings.currency);
  const addToast = useToastStore((s) => s.addToast);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white">
          Transaction Not Found
        </h2>
        <p className="text-sm text-surface-500">
          The transaction you are looking for does not exist or was removed.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/transactions')}
          leftIcon={<ArrowLeft size={16} />}
        >
          Return to Transactions
        </Button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === transaction.category);
  const isExpense = transaction.type === 'expense';

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    setIsDeleteModalOpen(false);
    navigate('/transactions');
    addToast({
      message: `Deleted "${transaction.title}"`,
      type: 'info',
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: () => {
          undoDelete();
          addToast({ message: 'Transaction restored!', type: 'success' });
        },
      },
    });
  };

  const handleDuplicate = () => {
    const duplicated = addTransaction({
      title: `${transaction.title} (Copy)`,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
      isRecurring: transaction.isRecurring,
      recurringFrequency: transaction.recurringFrequency,
    });
    addToast({
      message: `Duplicated "${duplicated.title}"`,
      type: 'success',
    });
    navigate(`/transactions/${duplicated.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/transactions')}
          className="inline-flex items-center gap-2 text-xs font-bold text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Ledger</span>
        </button>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            leftIcon={<Copy size={14} />}
          >
            Duplicate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit3 size={14} />}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            leftIcon={<Trash2 size={14} />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Detail Card */}
      <Card className="p-6 sm:p-8">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-100 dark:border-surface-800 gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: `${category?.color || '#6366f1'}18`,
                color: category?.color || '#6366f1',
              }}
            >
              <CategoryIcon name={category?.icon} size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <Badge variant={isExpense ? 'danger' : 'success'} size="md">
                  {isExpense ? 'Expense' : 'Income'}
                </Badge>
                {transaction.isRecurring && (
                  <Badge variant="primary" size="md" icon={<Repeat size={12} />}>
                    Recurring ({transaction.recurringFrequency || 'Monthly'})
                  </Badge>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-white mt-1.5">
                {transaction.title}
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-surface-400">Total Amount</span>
            <p
              className={`text-2xl sm:text-3xl font-black ${
                isExpense ? 'text-surface-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isExpense ? '-' : '+'}
              {formatCurrency(transaction.amount, currency)}
            </p>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-surface-100 dark:border-surface-800">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-surface-400 flex items-center gap-1.5">
              <Calendar size={14} /> Transaction Date
            </span>
            <p className="text-sm font-bold text-surface-900 dark:text-white">
              {formatDate(transaction.date, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-surface-400 flex items-center gap-1.5">
              <CreditCard size={14} /> Payment Method
            </span>
            <p className="text-sm font-bold text-surface-900 dark:text-white">
              {transaction.paymentMethod}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-surface-400">
              Category
            </span>
            <p className="text-sm font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: category?.color }}
              />
              {category?.name || 'Uncategorized'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-surface-400 flex items-center gap-1.5">
              <Clock size={14} /> Record Created
            </span>
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {formatDate(transaction.createdAt, 'MMM d, yyyy · h:mm a')}
            </p>
          </div>
        </div>

        {/* Notes section */}
        <div className="pt-6">
          <span className="text-xs font-semibold text-surface-400 flex items-center gap-1.5 mb-2">
            <FileText size={14} /> Transaction Notes & Remarks
          </span>
          <p className="text-sm text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/40 p-4 rounded-xl border border-surface-200/50 dark:border-surface-700/50 leading-relaxed">
            {transaction.notes || 'No extra notes provided for this transaction.'}
          </p>
        </div>
      </Card>

      {/* Edit Form Modal */}
      <TransactionFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={transaction}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        transaction={transaction}
      />
    </div>
  );
};
