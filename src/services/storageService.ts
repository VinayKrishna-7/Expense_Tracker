/**
 * Production-ready resilient Storage Service abstraction
 * Handles user-scoped localStorage reading, writing, JSON parsing, error trapping,
 * and database export/import functionality.
 */

export const STORAGE_KEYS = {
  USERS_REGISTRY: 'expenseflow_users_registry',
  AUTH_SESSION: 'expenseflow_auth_session',
  
  // Dynamic user-scoped key generators
  getUserTransactionsKey: (userId: string) => `expenseflow_${userId}_transactions`,
  getUserBudgetsKey: (userId: string) => `expenseflow_${userId}_budgets`,
  getUserGoalsKey: (userId: string) => `expenseflow_${userId}_goals`,
  getUserCategoriesKey: (userId: string) => `expenseflow_${userId}_categories`,
  getUserSettingsKey: (userId: string) => `expenseflow_${userId}_settings`,
  getUserNotificationsKey: (userId: string) => `expenseflow_${userId}_notifications`,
  getUserAccountsKey: (userId: string) => `expenseflow_${userId}_accounts`,
  getUserSubscriptionsKey: (userId: string) => `expenseflow_${userId}_subscriptions`,
} as const;

// In-memory fallback map for environments where localStorage is not available (Node.js/Vitest/SSR)
const memoryStore = new Map<string, string>();

export class StorageService {
  /**
   * Retrieves and parses data from storage with safe fallback
   */
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      let item: string | null = null;
      if (typeof localStorage !== 'undefined') {
        item = localStorage.getItem(key);
      } else {
        item = memoryStore.get(key) ?? null;
      }
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[StorageService] Error reading key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Serializes and writes data to storage
   */
  static setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, serialized);
      } else {
        memoryStore.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`[StorageService] Error writing key "${key}":`, error);
      return false;
    }
  }

  /**
   * Removes an item from storage
   */
  static removeItem(key: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      } else {
        memoryStore.delete(key);
      }
    } catch (error) {
      console.error(`[StorageService] Error removing key "${key}":`, error);
    }
  }

  /**
   * Exports full application state for the active user as a JSON string
   */
  static exportUserBackup(userId: string): string {
    const backup: Record<string, unknown> = {
      version: '1.0.0',
      userId,
      exportedAt: new Date().toISOString(),
      transactions: this.getItem(STORAGE_KEYS.getUserTransactionsKey(userId), []),
      budgets: this.getItem(STORAGE_KEYS.getUserBudgetsKey(userId), []),
      goals: this.getItem(STORAGE_KEYS.getUserGoalsKey(userId), []),
      categories: this.getItem(STORAGE_KEYS.getUserCategoriesKey(userId), []),
      settings: this.getItem(STORAGE_KEYS.getUserSettingsKey(userId), null),
      notifications: this.getItem(STORAGE_KEYS.getUserNotificationsKey(userId), []),
    };
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Restores user state from a JSON backup string
   */
  static importUserBackup(userId: string, jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || parsed === null) return false;

      if (Array.isArray(parsed.transactions)) {
        this.setItem(STORAGE_KEYS.getUserTransactionsKey(userId), parsed.transactions);
      }
      if (Array.isArray(parsed.budgets)) {
        this.setItem(STORAGE_KEYS.getUserBudgetsKey(userId), parsed.budgets);
      }
      if (Array.isArray(parsed.goals)) {
        this.setItem(STORAGE_KEYS.getUserGoalsKey(userId), parsed.goals);
      }
      if (Array.isArray(parsed.categories)) {
        this.setItem(STORAGE_KEYS.getUserCategoriesKey(userId), parsed.categories);
      }
      if (parsed.settings) {
        this.setItem(STORAGE_KEYS.getUserSettingsKey(userId), parsed.settings);
      }
      if (Array.isArray(parsed.notifications)) {
        this.setItem(STORAGE_KEYS.getUserNotificationsKey(userId), parsed.notifications);
      }
      return true;
    } catch (error) {
      console.error('[StorageService] Failed to import backup:', error);
      return false;
    }
  }

  /**
   * Clears all storage keys belonging to a specific user
   */
  static clearUserData(userId: string): void {
    this.removeItem(STORAGE_KEYS.getUserTransactionsKey(userId));
    this.removeItem(STORAGE_KEYS.getUserBudgetsKey(userId));
    this.removeItem(STORAGE_KEYS.getUserGoalsKey(userId));
    this.removeItem(STORAGE_KEYS.getUserCategoriesKey(userId));
    this.removeItem(STORAGE_KEYS.getUserSettingsKey(userId));
    this.removeItem(STORAGE_KEYS.getUserNotificationsKey(userId));
  }
}
