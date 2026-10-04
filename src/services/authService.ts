import { User, UserAccountRecord } from '../types/user';
import { CurrencyCode } from '../types/settings';
import { StorageService, STORAGE_KEYS } from './storageService';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_NOTIFICATIONS,
} from '../constants/seedData';

// Demo account definition for testing and exploratory mode
export const DEMO_USER: UserAccountRecord = {
  id: 'usr-demo-001',
  name: 'Demo Account',
  email: 'demo@expenseflow.com',
  passwordHash: 'demo123',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'INR',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export class AuthService {
  /**
   * Returns all registered users
   */
  static getRegisteredUsers(): UserAccountRecord[] {
    const users = StorageService.getItem<UserAccountRecord[]>(
      STORAGE_KEYS.USERS_REGISTRY,
      []
    );
    // Ensure demo user is in registry
    if (!users.some((u) => u.email.toLowerCase() === DEMO_USER.email.toLowerCase())) {
      users.unshift(DEMO_USER);
      StorageService.setItem(STORAGE_KEYS.USERS_REGISTRY, users);
      // Initialize demo data once for demo user
      this.initializeDemoData(DEMO_USER.id);
    }
    return users;
  }

  /**
   * Initializes sample demo data for a specific user ID
   */
  static initializeDemoData(userId: string): void {
    StorageService.setItem(
      STORAGE_KEYS.getUserTransactionsKey(userId),
      INITIAL_TRANSACTIONS
    );
    StorageService.setItem(
      STORAGE_KEYS.getUserBudgetsKey(userId),
      INITIAL_BUDGETS
    );
    StorageService.setItem(
      STORAGE_KEYS.getUserGoalsKey(userId),
      INITIAL_GOALS
    );
    StorageService.setItem(
      STORAGE_KEYS.getUserCategoriesKey(userId),
      DEFAULT_CATEGORIES
    );
    StorageService.setItem(
      STORAGE_KEYS.getUserNotificationsKey(userId),
      INITIAL_NOTIFICATIONS
    );
  }

  /**
   * Initializes a brand-new clean account for a newly registered user
   */
  static initializeCleanAccount(userId: string, currency: CurrencyCode): void {
    // 100% clean account: 0 transactions, 0 budgets, 0 goals
    StorageService.setItem(STORAGE_KEYS.getUserTransactionsKey(userId), []);
    StorageService.setItem(STORAGE_KEYS.getUserBudgetsKey(userId), []);
    StorageService.setItem(STORAGE_KEYS.getUserGoalsKey(userId), []);
    StorageService.setItem(
      STORAGE_KEYS.getUserCategoriesKey(userId),
      DEFAULT_CATEGORIES
    );
    StorageService.setItem(STORAGE_KEYS.getUserSettingsKey(userId), {
      theme: 'system',
      currency,
      weekStartsOn: 'monday',
      dateFormat: 'DD/MM/YYYY',
      enableNotifications: false,
      soundEnabled: false,
    });
    StorageService.setItem(STORAGE_KEYS.getUserNotificationsKey(userId), []);
  }

  /**
   * Retrieves the currently authenticated session user, or null
   */
  static getCurrentUser(): User | null {
    return StorageService.getItem<User | null>(
      STORAGE_KEYS.AUTH_SESSION,
      null
    );
  }

  /**
   * Login with email and password
   */
  static login(email: string, password?: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getRegisteredUsers();
        const cleanEmail = email.trim().toLowerCase();
        
        const existing = users.find(
          (u) => u.email.toLowerCase() === cleanEmail
        );

        if (!existing) {
          reject(new Error('No account found with this email address. Please register first.'));
          return;
        }

        if (password && existing.passwordHash && existing.passwordHash !== password) {
          reject(new Error('Incorrect password. Please verify and try again.'));
          return;
        }

        const sessionUser: User = {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          avatar: existing.avatar,
          currency: existing.currency,
          createdAt: existing.createdAt,
        };

        StorageService.setItem(STORAGE_KEYS.AUTH_SESSION, sessionUser);
        resolve(sessionUser);
      }, 250);
    });
  }

  /**
   * Register a new user with their own name, email, password, and currency
   */
  static register(
    name: string,
    email: string,
    password?: string,
    currency: CurrencyCode = 'INR'
  ): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getRegisteredUsers();
        const cleanEmail = email.trim().toLowerCase();

        if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
          reject(new Error('An account with this email already exists. Please log in instead.'));
          return;
        }

        const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const newAccount: UserAccountRecord = {
          id: userId,
          name: name.trim(),
          email: cleanEmail,
          passwordHash: password || 'password',
          currency,
          createdAt: new Date().toISOString(),
        };

        // Save new user to registry
        users.push(newAccount);
        StorageService.setItem(STORAGE_KEYS.USERS_REGISTRY, users);

        // Initialize pure clean isolated account
        this.initializeCleanAccount(userId, currency);

        // Log the user in
        const sessionUser: User = {
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          currency: newAccount.currency,
          createdAt: newAccount.createdAt,
        };
        StorageService.setItem(STORAGE_KEYS.AUTH_SESSION, sessionUser);

        resolve(sessionUser);
      }, 250);
    });
  }

  /**
   * Update active user profile
   */
  static updateProfile(updates: Partial<User>): User | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const updated: User = { ...current, ...updates };
    StorageService.setItem(STORAGE_KEYS.AUTH_SESSION, updated);

    // Also update in users registry
    const users = this.getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      StorageService.setItem(STORAGE_KEYS.USERS_REGISTRY, users);
    }

    return updated;
  }

  /**
   * Logout the active user
   */
  static logout(): void {
    StorageService.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }
}
