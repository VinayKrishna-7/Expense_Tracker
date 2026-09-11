import { useTransactionStore } from '../store/useTransactionStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useGoalStore } from '../store/useGoalStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useNotificationStore } from '../store/useNotificationStore';

/**
 * Synchronizes and refreshes all in-memory Zustand stores
 * with the currently authenticated user's isolated storage records.
 */
export function reloadAllUserStores(): void {
  useTransactionStore.getState().loadUserTransactions();
  useBudgetStore.getState().loadUserBudgets();
  useGoalStore.getState().loadUserGoals();
  useCategoryStore.getState().loadUserCategories();
  useSettingsStore.getState().loadUserSettings();
  useNotificationStore.getState().loadUserNotifications();
}
