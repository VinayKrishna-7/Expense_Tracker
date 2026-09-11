import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { TransactionFormModal } from '../transactions/TransactionFormModal';
import { BudgetFormModal } from '../budgets/BudgetFormModal';
import { GoalFormModal } from '../goals/GoalFormModal';
import { ToastContainer } from '../ui/Toast';
import { useTheme } from '../../hooks/useTheme';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const AppLayout: React.FC = () => {
  // Synchronize dark/light/system theme
  useTheme();

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modal states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<
    'expense' | 'income'
  >('expense');

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onNewTransaction: () => {
      setTransactionModalType('expense');
      setIsTransactionModalOpen(true);
    },
    onToggleCommandPalette: () => {
      setIsCommandPaletteOpen((prev) => !prev);
    },
    onToggleHelp: () => {
      setIsShortcutsModalOpen((prev) => !prev);
    },
    onCloseModals: () => {
      setIsCommandPaletteOpen(false);
      setIsNotificationCenterOpen(false);
      setIsShortcutsModalOpen(false);
      setIsTransactionModalOpen(false);
      setIsBudgetModalOpen(false);
      setIsGoalModalOpen(false);
    },
  });

  const handleOpenAddExpense = () => {
    setTransactionModalType('expense');
    setIsTransactionModalOpen(true);
  };

  const handleOpenAddIncome = () => {
    setTransactionModalType('income');
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex transition-colors">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Topbar */}
        <Topbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          onOpenNewTransaction={handleOpenAddExpense}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        />

        {/* Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet
            context={{
              onOpenAddExpense: handleOpenAddExpense,
              onOpenAddIncome: handleOpenAddIncome,
              onOpenAddBudget: () => setIsBudgetModalOpen(true),
              onOpenAddGoal: () => setIsGoalModalOpen(true),
            }}
          />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenNewTransaction={handleOpenAddExpense} />

      {/* Global Slideout Panels & Modals */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenAddExpense={handleOpenAddExpense}
        onOpenAddIncome={handleOpenAddIncome}
        onOpenAddBudget={() => setIsBudgetModalOpen(true)}
        onOpenAddGoal={() => setIsGoalModalOpen(true)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        defaultType={transactionModalType}
      />

      <BudgetFormModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      <GoalFormModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};
