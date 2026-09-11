import { create } from 'zustand';
import { Goal } from '../types/goal';
import { GoalService } from '../services/goalService';

interface GoalState {
  goals: Goal[];
  loadUserGoals: () => void;
  addGoal: (
    data: Omit<Goal, 'id' | 'currentAmount' | 'contributions' | 'createdAt' | 'updatedAt'> & {
      initialAmount?: number;
    }
  ) => Goal;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => Goal | null;
  addContribution: (id: string, amount: number, notes?: string) => Goal | null;
  deleteGoal: (id: string) => boolean;
  resetGoals: () => void;
  clearGoals: () => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: GoalService.getAll(),

  loadUserGoals: () => {
    set({ goals: GoalService.getAll() });
  },

  addGoal: (data) => {
    const newGoal = GoalService.add(data);
    set({ goals: GoalService.getAll() });
    return newGoal;
  },

  updateGoal: (id, updates) => {
    const updated = GoalService.update(id, updates);
    if (updated) {
      set({ goals: GoalService.getAll() });
    }
    return updated;
  },

  addContribution: (id, amount, notes) => {
    const updated = GoalService.addContribution(id, amount, notes);
    if (updated) {
      set({ goals: GoalService.getAll() });
    }
    return updated;
  },

  deleteGoal: (id) => {
    const success = GoalService.delete(id);
    if (success) {
      set({ goals: GoalService.getAll() });
    }
    return success;
  },

  resetGoals: () => {
    const resetData = GoalService.resetToSeed();
    set({ goals: resetData });
  },

  clearGoals: () => {
    GoalService.saveAll([]);
    set({ goals: [] });
  },
}));
