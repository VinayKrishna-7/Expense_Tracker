import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Receipt,
  PieChart,
  BarChart3,
  Target,
  Settings,
  PlusCircle,
  TrendingDown,
  Download,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { exportToCSV, downloadCSVFile } from '../../utils/csvHelper';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useToastStore } from '../../store/useToastStore';
import { clsx } from 'clsx';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddExpense?: () => void;
  onOpenAddIncome?: () => void;
  onOpenAddBudget?: () => void;
  onOpenAddGoal?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Preferences';
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenAddBudget,
  onOpenAddGoal,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const theme = useSettingsStore((s) => s.settings.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const addToast = useToastStore((s) => s.addToast);

  const commands: CommandItem[] = useMemo(() => {
    return [
      // Navigation
      {
        id: 'nav-dashboard',
        title: 'Go to Dashboard',
        category: 'Navigation',
        icon: <LayoutDashboard size={16} />,
        action: () => {
          navigate('/dashboard');
          onClose();
        },
      },
      {
        id: 'nav-accounts',
        title: 'Go to Accounts & Wallets',
        category: 'Navigation',
        icon: <LayoutDashboard size={16} />,
        action: () => {
          navigate('/accounts');
          onClose();
        },
      },
      {
        id: 'nav-subscriptions',
        title: 'Go to Subscriptions',
        category: 'Navigation',
        icon: <Receipt size={16} />,
        action: () => {
          navigate('/subscriptions');
          onClose();
        },
      },
      {
        id: 'nav-transactions',
        title: 'Go to Transactions',
        category: 'Navigation',
        icon: <Receipt size={16} />,
        action: () => {
          navigate('/transactions');
          onClose();
        },
      },
      {
        id: 'nav-budgets',
        title: 'Go to Budgets',
        category: 'Navigation',
        icon: <PieChart size={16} />,
        action: () => {
          navigate('/budgets');
          onClose();
        },
      },
      {
        id: 'nav-analytics',
        title: 'Go to Analytics',
        category: 'Navigation',
        icon: <BarChart3 size={16} />,
        action: () => {
          navigate('/analytics');
          onClose();
        },
      },
      {
        id: 'nav-goals',
        title: 'Go to Goals',
        category: 'Navigation',
        icon: <Target size={16} />,
        action: () => {
          navigate('/goals');
          onClose();
        },
      },
      {
        id: 'nav-settings',
        title: 'Go to Settings',
        category: 'Navigation',
        icon: <Settings size={16} />,
        action: () => {
          navigate('/settings');
          onClose();
        },
      },

      // Actions
      {
        id: 'act-add-expense',
        title: 'Add New Expense',
        category: 'Actions',
        icon: <TrendingDown size={16} className="text-rose-500" />,
        action: () => {
          onClose();
          onOpenAddExpense?.();
        },
      },
      {
        id: 'act-add-income',
        title: 'Add New Income',
        category: 'Actions',
        icon: <PlusCircle size={16} className="text-emerald-500" />,
        action: () => {
          onClose();
          onOpenAddIncome?.();
        },
      },
      {
        id: 'act-add-budget',
        title: 'Create Category Budget',
        category: 'Actions',
        icon: <PieChart size={16} className="text-amber-500" />,
        action: () => {
          onClose();
          onOpenAddBudget?.();
        },
      },
      {
        id: 'act-add-goal',
        title: 'Create Financial Goal',
        category: 'Actions',
        icon: <Target size={16} className="text-indigo-500" />,
        action: () => {
          onClose();
          onOpenAddGoal?.();
        },
      },
      {
        id: 'act-export-csv',
        title: 'Export Transactions as CSV',
        category: 'Actions',
        icon: <Download size={16} />,
        action: () => {
          const csv = exportToCSV(transactions, categories);
          downloadCSVFile(csv);
          addToast({
            message: 'Transactions exported to CSV successfully!',
            type: 'success',
          });
          onClose();
        },
      },

      // Preferences
      {
        id: 'pref-toggle-theme',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`,
        category: 'Preferences',
        icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
        action: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          onClose();
        },
      },
    ];
  }, [
    navigate,
    onClose,
    onOpenAddExpense,
    onOpenAddIncome,
    onOpenAddBudget,
    onOpenAddGoal,
    theme,
    setTheme,
    transactions,
    categories,
    addToast,
  ]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    return commands.filter((c) =>
      c.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-modal overflow-hidden z-10 animate-scale-in">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-surface-100 dark:border-surface-800">
          <Search size={18} className="text-surface-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-surface-400">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={clsx(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left',
                  selectedIndex === idx
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold'
                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                    {cmd.icon}
                  </span>
                  <span>{cmd.title}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-surface-400">
                  {cmd.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-100 dark:border-surface-800 text-[11px] text-surface-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-surface-200/70 dark:bg-surface-800 px-1.5 py-0.5 rounded text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="font-mono bg-surface-200/70 dark:bg-surface-800 px-1.5 py-0.5 rounded text-[10px]">
                ↓
              </kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="font-mono bg-surface-200/70 dark:bg-surface-800 px-1.5 py-0.5 rounded text-[10px]">
                Enter
              </kbd>{' '}
              to select
            </span>
          </div>
          <span>
            <kbd className="font-mono bg-surface-200/70 dark:bg-surface-800 px-1.5 py-0.5 rounded text-[10px]">
              Esc
            </kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  );
};
