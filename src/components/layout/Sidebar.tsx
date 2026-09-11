import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Repeat,
  Receipt,
  PieChart,
  BarChart3,
  Target,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { reloadAllUserStores } from '../../utils/userStoreSync';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenShortcuts: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onOpenShortcuts,
}) => {
  const navigate = useNavigate();
  const theme = useSettingsStore((s) => s.settings.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Building2 },
    { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    reloadAllUserStores();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200/80 dark:border-surface-800/80 transition-all duration-300 select-none z-30 h-screen sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-100 dark:border-surface-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20 shrink-0">
            EF
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-surface-900 to-surface-700 dark:from-white dark:to-surface-300 bg-clip-text text-transparent">
                ExpenseFlow
              </span>
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 tracking-wider uppercase">
                Pro Edition
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shadow-sm border border-brand-200/50 dark:border-brand-800/50'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800/60'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon
                size={20}
                className="shrink-0 transition-transform group-hover:scale-110"
              />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Controls / Help / Theme / User */}
      <div className="p-3 border-t border-surface-100 dark:border-surface-800/80 space-y-2">
        {/* Help & Shortcuts Trigger */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-800/60 transition-colors',
            collapsed && 'justify-center'
          )}
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle size={18} />
          {!collapsed && <span>Shortcuts & Help</span>}
        </button>

        {/* Theme Switcher */}
        {!collapsed ? (
          <div className="flex items-center justify-between p-1 bg-surface-100 dark:bg-surface-800 rounded-lg">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={clsx(
                'flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all',
                theme === 'light'
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-500 hover:text-surface-900'
              )}
            >
              <Sun size={14} className="mr-1.5" /> Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={clsx(
                'flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all',
                theme === 'dark'
                  ? 'bg-surface-900 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              )}
            >
              <Moon size={14} className="mr-1.5" /> Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={clsx(
                'flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all',
                theme === 'system'
                  ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              )}
            >
              <Laptop size={14} className="mr-1.5" /> Auto
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-center p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        )}

        {/* User Profile */}
        <div
          className={clsx(
            'flex items-center gap-3 p-2 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/50 dark:border-surface-700/50',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-2 ring-brand-500/20">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'U'
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-surface-900 dark:text-white truncate">
                  {user?.name || 'Account User'}
                </span>
                <span className="text-[11px] text-surface-400 truncate">
                  {user?.email || 'user@example.com'}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-surface-400 hover:text-rose-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
