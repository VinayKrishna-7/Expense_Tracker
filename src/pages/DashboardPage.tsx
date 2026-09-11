import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { QuickActions } from '../components/dashboard/QuickActions';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { SpendingTrendChart } from '../components/dashboard/SpendingTrendChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';
import { DeleteConfirmModal } from '../components/transactions/DeleteConfirmModal';
import { useAuthStore } from '../store/useAuthStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useToastStore } from '../store/useToastStore';
import { Transaction } from '../types';
import { Button } from '../components/ui/Button';
import { Plus, Sparkles } from 'lucide-react';
import { NetWorthCard } from '../components/dashboard/NetWorthCard';
import { FinancialHealthScoreCard } from '../components/dashboard/FinancialHealthScoreCard';
import { InsightsFeed } from '../components/dashboard/InsightsFeed';
import { useFinancialAnalytics } from '../hooks/useFinancialQueries';

export const DashboardPage: React.FC = () => {
  const context = useOutletContext<{
    onOpenAddExpense: () => void;
    onOpenAddIncome: () => void;
    onOpenAddBudget: () => void;
    onOpenAddGoal: () => void;
  }>();

  const user = useAuthStore((s) => s.user);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const undoDelete = useTransactionStore((s) => s.undoDelete);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const addToast = useToastStore((s) => s.addToast);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
  };

  const handleDelete = (tx: Transaction) => {
    setDeletingTransaction(tx);
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

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useFinancialAnalytics();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
            </h2>
            <span className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sparkles size={18} />
            </span>
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Here's your comprehensive financial overview, balance sheet, and spending health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            onClick={context.onOpenAddExpense}
            leftIcon={<Plus size={16} strokeWidth={2.5} />}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Net Worth & Health Score Dual Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetWorthCard data={analyticsData?.netWorth} isLoading={isAnalyticsLoading} />
        </div>
        <div>
          <FinancialHealthScoreCard
            healthScore={analyticsData?.healthScore}
            isLoading={isAnalyticsLoading}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <SummaryCards />

      {/* Rule-based Financial Insights Feed */}
      <InsightsFeed
        insights={analyticsData?.insights}
        isLoading={isAnalyticsLoading}
      />

      {/* Quick Action Buttons */}
      <QuickActions
        onAddExpense={context.onOpenAddExpense}
        onAddIncome={context.onOpenAddIncome}
        onAddBudget={context.onOpenAddBudget}
        onAddGoal={context.onOpenAddGoal}
      />

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart />
        </div>
        <div>
          <CategoryDonutChart />
        </div>
      </div>

      {/* Secondary Row: Spending Trend & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingTrendChart />
        <RecentTransactions
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onNewTransaction={context.onOpenAddExpense}
        />
      </div>

      {/* Edit Form Modal */}
      <TransactionFormModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        initialData={editingTransaction}
      />

      {/* Delete Confirmation Modal with Undo support */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        transaction={deletingTransaction}
      />
    </div>
  );
};
