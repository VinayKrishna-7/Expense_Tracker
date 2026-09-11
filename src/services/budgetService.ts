import { Budget } from '../types/budget';
import { StorageService, STORAGE_KEYS } from './storageService';
import { AuthService } from './authService';
import { INITIAL_BUDGETS } from '../constants/seedData';

export class BudgetService {
  private static getStorageKey(): string {
    const user = AuthService.getCurrentUser();
    const userId = user ? user.id : 'usr-demo-001';
    return STORAGE_KEYS.getUserBudgetsKey(userId);
  }

  static getAll(): Budget[] {
    const key = this.getStorageKey();
    return StorageService.getItem<Budget[]>(key, []);
  }

  static saveAll(budgets: Budget[]): boolean {
    const key = this.getStorageKey();
    return StorageService.setItem(key, budgets);
  }

  static add(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const list = this.getAll();
    const now = new Date().toISOString();

    const existingIdx = list.findIndex(
      (b) =>
        b.category === budget.category ||
        (budget.categoryId && (b.categoryId === budget.categoryId || b.category === budget.categoryId))
    );

    if (existingIdx !== -1) {
      const updated: Budget = {
        ...list[existingIdx],
        ...budget,
        updatedAt: now,
      };
      list[existingIdx] = updated;
      this.saveAll(list);
      return updated;
    }

    const newBudget: Budget = {
      ...budget,
      id: `bgt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newBudget);
    this.saveAll(list);
    return newBudget;
  }

  static update(id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt'>>): Budget | null {
    const list = this.getAll();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const updated: Budget = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.saveAll(list);
    return updated;
  }

  static delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((b) => b.id !== id);
    if (filtered.length === list.length) return false;
    this.saveAll(filtered);
    return true;
  }

  static resetToSeed(): Budget[] {
    this.saveAll(INITIAL_BUDGETS);
    return INITIAL_BUDGETS;
  }
}
