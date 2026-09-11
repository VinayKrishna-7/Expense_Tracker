import { Goal, GoalContribution } from '../types/goal';
import { StorageService, STORAGE_KEYS } from './storageService';
import { AuthService } from './authService';
import { INITIAL_GOALS } from '../constants/seedData';

export class GoalService {
  private static getStorageKey(): string {
    const user = AuthService.getCurrentUser();
    const userId = user ? user.id : 'usr-demo-001';
    return STORAGE_KEYS.getUserGoalsKey(userId);
  }

  static getAll(): Goal[] {
    const key = this.getStorageKey();
    return StorageService.getItem<Goal[]>(key, []);
  }

  static saveAll(goals: Goal[]): boolean {
    const key = this.getStorageKey();
    return StorageService.setItem(key, goals);
  }

  static add(goal: Omit<Goal, 'id' | 'currentAmount' | 'contributions' | 'createdAt' | 'updatedAt'> & { initialAmount?: number }): Goal {
    const list = this.getAll();
    const now = new Date().toISOString();
    const initialAmount = goal.initialAmount || 0;
    const initialContributions: GoalContribution[] = initialAmount > 0 ? [
      {
        id: `gc-${Date.now()}`,
        amount: initialAmount,
        date: new Date().toISOString().slice(0, 10),
        notes: 'Initial allocation',
      },
    ] : [];

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: initialAmount,
      deadline: goal.deadline,
      category: goal.category || 'General',
      color: goal.color || '#6366f1',
      icon: goal.icon || 'Target',
      contributions: initialContributions,
      isCompleted: initialAmount >= goal.targetAmount,
      createdAt: now,
      updatedAt: now,
    };
    list.push(newGoal);
    this.saveAll(list);
    return newGoal;
  }

  static update(id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>): Goal | null {
    const list = this.getAll();
    const index = list.findIndex((g) => g.id === id);
    if (index === -1) return null;

    const updated: Goal = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.saveAll(list);
    return updated;
  }

  static addContribution(id: string, amount: number, notes?: string): Goal | null {
    const list = this.getAll();
    const index = list.findIndex((g) => g.id === id);
    if (index === -1) return null;

    const goal = list[index];
    const newAmount = (goal.currentAmount || 0) + amount;
    const contribution: GoalContribution = {
      id: `gc-${Date.now()}`,
      amount,
      date: new Date().toISOString().slice(0, 10),
      notes,
    };

    const updated: Goal = {
      ...goal,
      currentAmount: newAmount,
      contributions: [...(goal.contributions || []), contribution],
      isCompleted: newAmount >= goal.targetAmount,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveAll(list);
    return updated;
  }

  static delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((g) => g.id !== id);
    if (filtered.length === list.length) return false;
    this.saveAll(filtered);
    return true;
  }

  static resetToSeed(): Goal[] {
    this.saveAll(INITIAL_GOALS);
    return INITIAL_GOALS;
  }
}
