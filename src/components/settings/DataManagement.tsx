import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { StorageService } from '../../services/storageService';
import { AuthService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { exportToCSV, downloadCSVFile } from '../../utils/csvHelper';
import { reloadAllUserStores } from '../../utils/userStoreSync';
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  Database,
  Sparkles,
} from 'lucide-react';

export const DataManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);

  const resetAllTransactions = useTransactionStore((s) => s.resetAll);
  const clearAllTransactions = useTransactionStore((s) => s.clearAllTransactions);
  const resetBudgets = useBudgetStore((s) => s.resetBudgets);
  const clearBudgets = useBudgetStore((s) => s.clearBudgets);
  const resetGoals = useGoalStore((s) => s.resetGoals);
  const clearGoals = useGoalStore((s) => s.clearGoals);
  const resetCategories = useCategoryStore((s) => s.resetCategories);
  const clearNotifications = useNotificationStore((s) => s.clearAll);
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const addToast = useToastStore((s) => s.addToast);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Export JSON Backup for active user
  const handleExportBackup = () => {
    if (!user) return;
    const backupJson = StorageService.exportUserBackup(user.id);
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenseflow-${user.name.toLowerCase().replace(/\s+/g, '-')}-backup-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast({
      message: 'Account backup downloaded successfully!',
      type: 'success',
    });
  };

  // Import JSON Backup for active user
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importUserBackup(user.id, content);
      if (success) {
        reloadAllUserStores();
        addToast({
          message: 'Account backup restored successfully!',
          type: 'success',
        });
      } else {
        addToast({
          message: 'Invalid backup file format.',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = exportToCSV(transactions, categories);
    downloadCSVFile(csv);
    addToast({
      message: 'CSV export complete!',
      type: 'success',
    });
  };

  // Load Starter Demo Data into this account
  const handleConfirmReset = () => {
    if (!user) return;
    AuthService.initializeDemoData(user.id);
    reloadAllUserStores();
    addToast({
      message: 'Starter financial data populated in your account.',
      type: 'success',
    });
    setIsResetConfirmOpen(false);
  };

  // Clear All Data for this account
  const handleConfirmClear = () => {
    if (!user) return;
    StorageService.clearUserData(user.id);
    clearAllTransactions();
    clearBudgets();
    clearGoals();
    clearNotifications();
    reloadAllUserStores();
    addToast({
      message: 'All transactions, budgets, and goals have been cleared from your account.',
      type: 'info',
    });
    setIsClearConfirmOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-base font-bold text-surface-900 dark:text-white">
            Data Storage & System Operations
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Backup, restore, export, or clear your account's financial records
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-surface-900 dark:text-white font-bold text-sm">
                <Database size={18} className="text-brand-500" />
                <span>Export Account Backup</span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                Download a complete JSON snapshot of your transactions, budgets, goals, and categories.
              </p>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportBackup}
                leftIcon={<Download size={14} />}
              >
                Export JSON Backup
              </Button>
            </div>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-surface-900 dark:text-white font-bold text-sm">
                <Upload size={18} className="text-indigo-500" />
                <span>Restore Account Backup</span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                Restore your personal financial data from a previously saved JSON backup file.
              </p>
            </div>
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportBackup}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload size={14} />}
              >
                Upload Backup File
              </Button>
            </div>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-surface-900 dark:text-white font-bold text-sm">
                <FileSpreadsheet size={18} className="text-emerald-500" />
                <span>Export Transactions to CSV</span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                Export your personal ledger records into spreadsheet-ready CSV.
              </p>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download size={14} />}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Load Sample Starter Data */}
          <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-surface-900 dark:text-white font-bold text-sm">
                <Sparkles size={18} className="text-amber-500" />
                <span>Load Starter Sample Data</span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                Optional: Populate your account with realistic sample transactions, budgets, and goals to explore.
              </p>
            </div>
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsResetConfirmOpen(true)}
                leftIcon={<RotateCcw size={14} />}
              >
                Load Starter Data
              </Button>
            </div>
          </div>
        </div>

        {/* Destructive Clear All Action */}
        <div className="pt-4 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Clear Account Data
            </p>
            <p className="text-xs text-surface-400">
              Erase all transactions, custom categories, budgets, and goals from this account.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsClearConfirmOpen(true)}
            leftIcon={<Trash2 size={14} />}
          >
            Clear All Records
          </Button>
        </div>
      </CardContent>

      {/* Confirmation Dialogs */}
      <Dialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Load Starter Sample Data?"
        description="This will add sample transactions, category budgets, and financial goals to your account. Continue?"
        confirmText="Load Sample Data"
        type="warning"
      />

      <Dialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear All Account Data?"
        description="This will erase all recorded transactions, budgets, and goals from your personal account. Your login credentials will remain intact."
        confirmText="Clear All Data"
        confirmVariant="danger"
        type="danger"
      />
    </Card>
  );
};
