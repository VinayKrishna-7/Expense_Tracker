import { create } from 'zustand';
import { UserSettings, ThemeMode, CurrencyCode, WeekStartDay, DateFormatPattern } from '../types/settings';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { AuthService } from '../services/authService';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  currency: 'INR',
  weekStartsOn: 'monday',
  dateFormat: 'DD/MM/YYYY',
  enableNotifications: true,
  soundEnabled: true,
};

interface SettingsState {
  settings: UserSettings;
  loadUserSettings: () => void;
  setTheme: (theme: ThemeMode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setWeekStartsOn: (weekStartsOn: WeekStartDay) => void;
  setDateFormat: (dateFormat: DateFormatPattern) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

function getSettingsStorageKey(): string {
  const user = AuthService.getCurrentUser();
  const userId = user ? user.id : 'usr-demo-001';
  return STORAGE_KEYS.getUserSettingsKey(userId);
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const getInitial = () => {
    const user = AuthService.getCurrentUser();
    const fallback = user ? { ...DEFAULT_SETTINGS, currency: user.currency } : DEFAULT_SETTINGS;
    return StorageService.getItem<UserSettings>(getSettingsStorageKey(), fallback);
  };

  const persist = (updated: UserSettings) => {
    StorageService.setItem(getSettingsStorageKey(), updated);
  };

  return {
    settings: getInitial(),

    loadUserSettings: () => {
      set({ settings: getInitial() });
    },

    setTheme: (theme) =>
      set((state) => {
        const next = { ...state.settings, theme };
        persist(next);
        return { settings: next };
      }),
    setCurrency: (currency) =>
      set((state) => {
        const next = { ...state.settings, currency };
        persist(next);
        return { settings: next };
      }),
    setWeekStartsOn: (weekStartsOn) =>
      set((state) => {
        const next = { ...state.settings, weekStartsOn };
        persist(next);
        return { settings: next };
      }),
    setDateFormat: (dateFormat) =>
      set((state) => {
        const next = { ...state.settings, dateFormat };
        persist(next);
        return { settings: next };
      }),
    setNotificationsEnabled: (enableNotifications) =>
      set((state) => {
        const next = { ...state.settings, enableNotifications };
        persist(next);
        return { settings: next };
      }),
    updateSettings: (partial) =>
      set((state) => {
        const next = { ...state.settings, ...partial };
        persist(next);
        return { settings: next };
      }),
    resetSettings: () => {
      persist(DEFAULT_SETTINGS);
      set({ settings: DEFAULT_SETTINGS });
    },
  };
});
