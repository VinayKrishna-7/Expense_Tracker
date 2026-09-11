import { create } from 'zustand';
import { Budget } from '../types/budget';
import { BudgetService } from '../services/budgetService';

interface BudgetState {
  budgets: Budget[];
  loadUserBudgets: () => void;
  addBudget: (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Budget;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt'>>) => Budget | null;
  deleteBudget: (id: string) => boolean;
  resetBudgets: () => void;
  clearBudgets: () => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: BudgetService.getAll(),

  loadUserBudgets: () => {
    set({ budgets: BudgetService.getAll() });
  },

  addBudget: (data) => {
    const newBudget = BudgetService.add(data);
    set({ budgets: BudgetService.getAll() });
    return newBudget;
  },

  updateBudget: (id, updates) => {
    const updated = BudgetService.update(id, updates);
    if (updated) {
      set({ budgets: BudgetService.getAll() });
    }
    return updated;
  },

  deleteBudget: (id) => {
    const success = BudgetService.delete(id);
    if (success) {
      set({ budgets: BudgetService.getAll() });
    }
    return success;
  },

  resetBudgets: () => {
    const resetData = BudgetService.resetToSeed();
    set({ budgets: resetData });
  },

  clearBudgets: () => {
    BudgetService.saveAll([]);
    set({ budgets: [] });
  },
}));
