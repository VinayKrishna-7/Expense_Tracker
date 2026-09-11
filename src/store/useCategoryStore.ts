import { create } from 'zustand';
import { Category } from '../types/category';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { AuthService } from '../services/authService';

interface CategoryState {
  categories: Category[];
  loadUserCategories: () => void;
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => boolean;
  deleteCategory: (id: string) => boolean;
  resetCategories: () => void;
}

function getCategoryStorageKey(): string {
  const user = AuthService.getCurrentUser();
  const userId = user ? user.id : 'usr-demo-001';
  return STORAGE_KEYS.getUserCategoriesKey(userId);
}

export const useCategoryStore = create<CategoryState>((set) => {
  const getInitial = () => {
    return StorageService.getItem<Category[]>(
      getCategoryStorageKey(),
      DEFAULT_CATEGORIES
    );
  };

  const persist = (updated: Category[]) => {
    StorageService.setItem(getCategoryStorageKey(), updated);
  };

  return {
    categories: getInitial(),

    loadUserCategories: () => {
      set({ categories: getInitial() });
    },

    addCategory: (categoryData) => {
      const newCategory: Category = {
        ...categoryData,
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        isCustom: true,
      };
      set((state) => {
        const next = [...state.categories, newCategory];
        persist(next);
        return { categories: next };
      });
      return newCategory;
    },
    updateCategory: (id, updates) => {
      let updated = false;
      set((state) => {
        const next = state.categories.map((c) => {
          if (c.id === id) {
            updated = true;
            return { ...c, ...updates };
          }
          return c;
        });
        if (updated) persist(next);
        return { categories: next };
      });
      return updated;
    },
    deleteCategory: (id) => {
      let deleted = false;
      set((state) => {
        const next = state.categories.filter((c) => c.id !== id);
        if (next.length !== state.categories.length) {
          deleted = true;
          persist(next);
        }
        return { categories: next };
      });
      return deleted;
    },
    resetCategories: () => {
      persist(DEFAULT_CATEGORIES);
      set({ categories: DEFAULT_CATEGORIES });
    },
  };
});
