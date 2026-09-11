import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { CURRENCIES } from '../../constants/currencies';
import { CurrencyCode, WeekStartDay, DateFormatPattern } from '../../types/settings';
import { Select } from '../ui/Select';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export const CurrencySettings: React.FC = () => {
  const { settings, setCurrency, setWeekStartsOn, setDateFormat } =
    useSettingsStore();
  const addToast = useToastStore((s) => s.addToast);

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    addToast({
      message: `Currency updated to ${CURRENCIES[code].name}`,
      type: 'success',
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div>
          <h3 className="text-base font-bold text-surface-900 dark:text-white">
            Currency & Regional Formatting
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Configure primary currency and financial date formats
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        {/* Currency selection cards */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-400 mb-2.5">
            Primary Application Currency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const curr = CURRENCIES[code];
              const isSelected = settings.currency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleCurrencyChange(code)}
                  className={clsx(
                    'flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all relative',
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                      : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-700 bg-white dark:bg-surface-900'
                  )}
                >
                  <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                    {curr.symbol}
                  </span>
                  <span className="font-bold text-xs text-surface-900 dark:text-white mt-1">
                    {curr.code}
                  </span>
                  <span className="text-[10px] text-surface-400">
                    {curr.name.split('(')[0]}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Week Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-surface-100 dark:border-surface-800">
          <Select
            label="First Day of the Week"
            value={settings.weekStartsOn}
            onChange={(e) =>
              setWeekStartsOn(e.target.value as WeekStartDay)
            }
          >
            <option value="monday">Monday (Standard)</option>
            <option value="sunday">Sunday</option>
          </Select>

          <Select
            label="Date Display Format"
            value={settings.dateFormat}
            onChange={(e) =>
              setDateFormat(e.target.value as DateFormatPattern)
            }
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 11/09/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/11/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-11)</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
