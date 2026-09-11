import React, { useState, useMemo } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useToastStore } from '../store/useToastStore';
import { calculateBudgetsProgress } from '../utils/calculations';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetFormModal } from '../components/budgets/BudgetFormModal';
import { BudgetAlertBanner } from '../components/budgets/BudgetAlertBanner';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Budget, BudgetProgress } from '../types/budget';
import { Plus, PieChart } from 'lucide-react';
import { parseISO, isSameMonth } from 'date-fns';

export const BudgetsPage: React.FC = () => {
  const budgets = useBudgetStore((s) => s.budgets);
  const deleteBudget = useBudgetStore((s) => s.deleteBudget);
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const addToast = useToastStore((s) => s.addToast);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingProgress, setDeletingProgress] =
    useState<BudgetProgress | null>(null);

  // Current month transactions for budget tracking
  const currentMonthTx = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      try {
        return isSameMonth(parseISO(t.date), now);
      } catch {
        return false;
      }
    });
  }, [transactions]);

  // Dynamic progress calculation
  const budgetsProgress = useMemo(() => {
    return calculateBudgetsProgress(budgets, currentMonthTx, categories);
  }, [budgets, currentMonthTx, categories]);

  const handleEdit = (progress: BudgetProgress) => {
    setEditingBudget(progress.budget);
    setIsFormModalOpen(true);
  };

  const handleDelete = (progress: BudgetProgress) => {
    setDeletingProgress(progress);
  };

  const handleConfirmDelete = () => {
    if (!deletingProgress) return;
    deleteBudget(deletingProgress.budget.id);
    addToast({
      message: 'Budget removed successfully.',
      type: 'info',
    });
    setDeletingProgress(null);
  };

  const getCategoryName = (catIdOrName: string) => {
    return (
      categories.find((c) => c.id === catIdOrName || c.name === catIdOrName)?.name ||
      catIdOrName
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Monthly Budgets
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Set monthly category spending caps, prevent overspending, and track allocation health.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingBudget(null);
            setIsFormModalOpen(true);
          }}
          leftIcon={<Plus size={16} strokeWidth={2.5} />}
        >
          Create Budget
        </Button>
      </div>

      {/* Multi-tier Warning and Exceeded Banner */}
      <BudgetAlertBanner progressList={budgetsProgress} />

      {/* Budgets Grid */}
      {budgetsProgress.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No category budgets set"
          description="Create your first budget to set spending limits for groceries, dining, entertainment, and more."
          actionLabel="+ Create Budget"
          onAction={() => {
            setEditingBudget(null);
            setIsFormModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgetsProgress.map((item) => (
            <BudgetCard
              key={item.budget.id}
              progress={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Budget Form Modal */}
      <BudgetFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingBudget(null);
        }}
        initialData={editingBudget}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deletingProgress}
        onClose={() => setDeletingProgress(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Budget Limit?"
        description={`Are you sure you want to remove the monthly budget for "${
          deletingProgress ? getCategoryName(deletingProgress.budget.category) : ''
        }"?`}
        confirmText="Delete Budget"
        confirmVariant="danger"
        type="danger"
      />
    </div>
  );
};
