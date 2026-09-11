import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ThemeMode } from '../../types/settings';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { clsx } from 'clsx';

export const AppearanceSettings: React.FC = () => {
  const theme = useSettingsStore((s) => s.settings.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun size={20} className="text-amber-500" />,
      desc: 'Clean, crisp white interface with optimal readability',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon size={20} className="text-indigo-400" />,
      desc: 'Dark theme optimized for low-light environments',
    },
    {
      value: 'system',
      label: 'System Preference',
      icon: <Laptop size={20} className="text-surface-500" />,
      desc: 'Automatically synchronizes with your device theme settings',
    },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div>
          <h3 className="text-base font-bold text-surface-900 dark:text-white">
            Appearance & Theme
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Customize the look and feel of ExpenseFlow
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={clsx(
                'flex flex-col p-4 rounded-xl border text-left transition-all relative group',
                theme === opt.value
                  ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                  : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 bg-white dark:bg-surface-900'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800">
                  {opt.icon}
                </div>
                {theme === opt.value && (
                  <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
              <span className="font-bold text-sm text-surface-900 dark:text-white">
                {opt.label}
              </span>
              <span className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
