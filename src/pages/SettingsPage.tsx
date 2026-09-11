import React from 'react';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { CurrencySettings } from '../components/settings/CurrencySettings';
import { CategoryManager } from '../components/settings/CategoryManager';
import { DataManagement } from '../components/settings/DataManagement';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Manage your theme, currency, categories, and database backup operations.
        </p>
      </div>

      {/* Theme & Appearance */}
      <AppearanceSettings />

      {/* Currency & Formatting */}
      <CurrencySettings />

      {/* Categories CRUD */}
      <CategoryManager />

      {/* Backup, Import, Export, Reset & Clear */}
      <DataManagement />
    </div>
  );
};
