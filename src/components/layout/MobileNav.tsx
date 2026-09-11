import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Repeat,
  Receipt,
  PieChart,
  BarChart3,
  Target,
  Settings,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';

interface MobileNavProps {
  onOpenNewTransaction: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenNewTransaction }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Building2 },
    { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Goals', path: '/goals', icon: Target },
  ];

  return (
    <>
      {/* Mobile Drawer (Side sheet) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-surface-900 shadow-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-sm">
                    EF
                  </div>
                  <span className="font-extrabold text-base text-surface-900 dark:text-white">
                    ExpenseFlow
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="mt-6 space-y-1.5">
                {[...mainNav, { name: 'Settings', path: '/settings', icon: Settings }].map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsDrawerOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                        )
                      }
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-t border-surface-200 dark:border-surface-800 px-3 py-2 flex items-center justify-around">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500'
            )
          }
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500'
            )
          }
        >
          <Receipt size={20} />
          <span>Activity</span>
        </NavLink>

        {/* Central Add Button */}
        <button
          type="button"
          onClick={onOpenNewTransaction}
          className="p-3 bg-brand-600 text-white rounded-full shadow-lg shadow-brand-500/30 -mt-6 hover:bg-brand-700 active:scale-95 transition-all"
          title="Add Transaction"
        >
          <Plus size={20} strokeWidth={3} />
        </button>

        <NavLink
          to="/budgets"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500'
            )
          }
        >
          <PieChart size={20} />
          <span>Budgets</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-surface-500 hover:text-surface-900 dark:hover:text-surface-100"
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </div>
    </>
  );
};
