import React from 'react';
import {
  TrendingDown,
  PlusCircle,
  PieChart,
  Target,
  Download,
} from 'lucide-react';
import { exportToCSV, downloadCSVFile } from '../../utils/csvHelper';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useToastStore } from '../../store/useToastStore';

interface QuickActionsProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onAddBudget: () => void;
  onAddGoal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddExpense,
  onAddIncome,
  onAddBudget,
  onAddGoal,
}) => {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const addToast = useToastStore((s) => s.addToast);

  const handleExport = () => {
    const csv = exportToCSV(transactions, categories);
    downloadCSVFile(csv);
    addToast({
      message: 'Transactions exported to CSV successfully!',
      type: 'success',
    });
  };

  const actions = [
    {
      label: 'Add Expense',
      icon: TrendingDown,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200/60 dark:border-rose-800/60',
      onClick: onAddExpense,
    },
    {
      label: 'Add Income',
      icon: PlusCircle,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60',
      onClick: onAddIncome,
    },
    {
      label: 'Create Budget',
      icon: PieChart,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/60',
      onClick: onAddBudget,
    },
    {
      label: 'Add Goal',
      icon: Target,
      color: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 border-brand-200/60 dark:border-brand-800/60',
      onClick: onAddGoal,
    },
    {
      label: 'Export CSV',
      icon: Download,
      color: 'text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700',
      onClick: handleExport,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={act.onClick}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800/80 shadow-subtle hover:shadow-card-hover hover:border-surface-300 dark:hover:border-surface-700 transition-all text-left group"
          >
            <div
              className={`p-2 rounded-lg border shrink-0 transition-transform group-hover:scale-105 ${act.color}`}
            >
              <Icon size={16} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-surface-800 dark:text-surface-100 group-hover:text-brand-600 transition-colors">
              {act.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
