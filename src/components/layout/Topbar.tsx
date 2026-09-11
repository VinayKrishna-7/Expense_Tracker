import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Plus,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { reloadAllUserStores } from '../../utils/userStoreSync';

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  onOpenNewTransaction: () => void;
  onOpenShortcuts: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenCommandPalette,
  onOpenNotifications,
  onOpenNewTransaction,
  onOpenShortcuts,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/transactions/')) return 'Transaction Details';
    switch (path) {
      case '/':
      case '/dashboard':
        return 'Financial Overview';
      case '/transactions':
        return 'Transactions & Ledger';
      case '/budgets':
        return 'Monthly Budgets';
      case '/analytics':
        return 'Financial Analytics & Insights';
      case '/goals':
        return 'Savings & Financial Goals';
      case '/settings':
        return 'Preferences & Settings';
      default:
        return 'ExpenseFlow';
    }
  };

  const handleLogout = () => {
    logout();
    reloadAllUserStores();
    navigate('/login');
  };

  const profileMenuItems: DropdownItem[] = [
    {
      label: 'Settings',
      icon: <Settings size={16} />,
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Keyboard Shortcuts',
      icon: <HelpCircle size={16} />,
      onClick: onOpenShortcuts,
    },
    {
      label: 'Sign Out',
      icon: <LogOut size={16} />,
      variant: 'danger',
      onClick: handleLogout,
    },
  ];

  return (
    <header className="h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200/80 dark:border-surface-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Title / Breadcrumb */}
      <div>
        <h1 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Search / Command palette trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 text-xs text-surface-400 bg-surface-100 dark:bg-surface-800/80 hover:bg-surface-200/60 dark:hover:bg-surface-700/80 rounded-lg border border-surface-200/50 dark:border-surface-700/50 transition-colors"
        >
          <Search size={14} />
          <span>Search or jump to...</span>
          <kbd className="font-mono bg-white dark:bg-surface-900 px-1.5 py-0.5 rounded border border-surface-200 dark:border-surface-700 text-[10px] font-semibold text-surface-500">
            ⌘K
          </kbd>
        </button>

        {/* Quick Add Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewTransaction}
          leftIcon={<Plus size={16} strokeWidth={2.5} />}
          className="hidden sm:inline-flex"
        >
          Add Record
        </Button>

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Open notifications"
          className="relative p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-500 rounded-full ring-2 ring-white dark:ring-surface-900 animate-pulse" />
          )}
        </button>

        {/* Profile Avatar Dropdown */}
        <Dropdown
          trigger={
            <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden ring-2 ring-brand-500/20 hover:ring-brand-500/40 transition-all flex items-center justify-center font-bold text-xs text-surface-700 dark:text-surface-200">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'U'
              )}
            </div>
          }
          items={profileMenuItems}
        />
      </div>
    </header>
  );
};
