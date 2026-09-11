import React, { useState, useMemo, useRef } from 'react';
import { useTransactionStore } from '../store/useTransactionStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useToastStore } from '../store/useToastStore';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionCard } from '../components/transactions/TransactionCard';
import { FilterPanel } from '../components/transactions/FilterPanel';
import { ActiveFilterChips } from '../components/transactions/ActiveFilterChips';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';
import { DeleteConfirmModal } from '../components/transactions/DeleteConfirmModal';
import { ImportCsvModal } from '../components/transactions/ImportCsvModal';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { exportToCSV, downloadCSVFile } from '../utils/csvHelper';
import { Transaction } from '../types/transaction';
import {
  Plus,
  Filter,
  Download,
  Upload,
  Receipt,
  Search,
} from 'lucide-react';
import { parseISO, isAfter, isBefore, isSameDay } from 'date-fns';

export const TransactionsPage: React.FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const transactions = useTransactionStore((s) => s.transactions);
  const filters = useTransactionStore((s) => s.filters);
  const setFilters = useTransactionStore((s) => s.setFilters);
  const sort = useTransactionStore((s) => s.sort);
  const page = useTransactionStore((s) => s.page);
  const pageSize = useTransactionStore((s) => s.pageSize);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const undoDelete = useTransactionStore((s) => s.undoDelete);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const categories = useCategoryStore((s) => s.categories);
  const addToast = useToastStore((s) => s.addToast);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  // Filtered and Sorted list
  const filteredAndSorted = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search filter
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          const matchMethod = t.paymentMethod.toLowerCase().includes(q);
          if (!matchTitle && !matchNotes && !matchMethod) return false;
        }

        // Type filter
        if (filters.type && filters.type !== 'all' && t.type !== filters.type) {
          return false;
        }

        // Category filter
        if (
          filters.category &&
          filters.category !== 'all' &&
          t.category !== filters.category
        ) {
          return false;
        }

        // Payment Method filter
        if (
          filters.paymentMethod &&
          filters.paymentMethod !== 'all' &&
          t.paymentMethod !== filters.paymentMethod
        ) {
          return false;
        }

        // Date range
        if (filters.startDate) {
          try {
            const txDate = parseISO(t.date);
            const start = parseISO(filters.startDate);
            if (isBefore(txDate, start) && !isSameDay(txDate, start)) return false;
          } catch {
            // ignore
          }
        }

        if (filters.endDate) {
          try {
            const txDate = parseISO(t.date);
            const end = parseISO(filters.endDate);
            if (isAfter(txDate, end) && !isSameDay(txDate, end)) return false;
          } catch {
            // ignore
          }
        }

        // Min / Max Amount
        if (filters.minAmount !== undefined && t.amount < filters.minAmount) {
          return false;
        }
        if (filters.maxAmount !== undefined && t.amount > filters.maxAmount) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort.field === 'date') {
          return sort.order === 'asc'
            ? a.date.localeCompare(b.date)
            : b.date.localeCompare(a.date);
        }
        if (sort.field === 'amount') {
          return sort.order === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount;
        }
        if (sort.field === 'title') {
          return sort.order === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
        return 0;
      });
  }, [transactions, filters, sort]);

  // Paginated chunk
  const paginatedTransactions = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filteredAndSorted.slice(startIdx, startIdx + pageSize);
  }, [filteredAndSorted, page, pageSize]);

  const handleExport = () => {
    const csv = exportToCSV(filteredAndSorted, categories);
    downloadCSVFile(csv);
    addToast({
      message: `Exported ${filteredAndSorted.length} transactions as CSV!`,
      type: 'success',
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingTransaction) return;
    const tx = deletingTransaction;
    deleteTransaction(tx.id);
    setDeletingTransaction(null);

    addToast({
      message: `Deleted "${tx.title}"`,
      type: 'info',
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: () => {
          undoDelete();
          addToast({
            message: 'Transaction restored!',
            type: 'success',
          });
        },
      },
    });
  };

  const handleDuplicate = (tx: Transaction) => {
    const duplicated = addTransaction({
      title: `${tx.title} (Copy)`,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: tx.paymentMethod,
      notes: tx.notes,
      isRecurring: tx.isRecurring,
      recurringFrequency: tx.recurringFrequency,
    });
    addToast({
      message: `Duplicated "${duplicated.title}"`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Transactions
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Track, search, categorize, and manage all your financial activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            leftIcon={<Upload size={14} />}
          >
            Import CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download size={14} />}
          >
            Export
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            leftIcon={<Plus size={16} strokeWidth={2.5} />}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchInput
            ref={searchInputRef}
            value={filters.search || ''}
            onChange={(val) => setFilters({ search: val })}
            placeholder="Search by description, payment method, notes... (/ to focus)"
          />
        </div>

        <Button
          variant={isFilterOpen ? 'primary' : 'secondary'}
          size="md"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          leftIcon={<Filter size={16} />}
        >
          Filters
        </Button>
      </div>

      {/* Filter Panel Drawer */}
      <FilterPanel isOpen={isFilterOpen} />

      {/* Active Filter Chips */}
      <ActiveFilterChips />

      {/* Data Presentation */}
      {filteredAndSorted.length === 0 ? (
        <EmptyState
          icon={transactions.length === 0 ? Receipt : Search}
          title={
            transactions.length === 0
              ? 'No transactions yet'
              : 'No matching transactions found'
          }
          description={
            transactions.length === 0
              ? 'Start tracking your finances by logging your first transaction.'
              : 'Try changing your search terms or clearing some filters.'
          }
          actionLabel={
            transactions.length === 0 ? '+ Add Transaction' : 'Clear All Filters'
          }
          onAction={
            transactions.length === 0
              ? () => setIsNewModalOpen(true)
              : () => setFilters({ search: '', type: 'all', category: 'all', paymentMethod: 'all', startDate: '', endDate: '', minAmount: undefined, maxAmount: undefined })
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <TransactionTable
              transactions={paginatedTransactions}
              totalCount={filteredAndSorted.length}
              onEdit={setEditingTransaction}
              onDelete={setDeletingTransaction}
              onDuplicate={handleDuplicate}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {paginatedTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onEdit={setEditingTransaction}
                onDelete={setDeletingTransaction}
                onDuplicate={handleDuplicate}
              />
            ))}

            {/* Mobile Pagination indicator */}
            {filteredAndSorted.length > pageSize && (
              <div className="pt-3 flex items-center justify-between text-xs text-surface-500">
                <span>
                  Showing {paginatedTransactions.length} of{' '}
                  {filteredAndSorted.length} records
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* New / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isNewModalOpen || !!editingTransaction}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingTransaction(null);
        }}
        initialData={editingTransaction}
      />

      {/* Delete Confirmation Modal with Undo Toast */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        transaction={deletingTransaction}
      />

      {/* Import CSV Modal */}
      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
