import { Category } from '../types/category';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'cat-food', name: 'Food & Dining', icon: 'Utensils', color: '#f97316', type: 'expense' },
  { id: 'cat-transport', name: 'Transport & Fuel', icon: 'Car', color: '#3b82f6', type: 'expense' },
  { id: 'cat-shopping', name: 'Shopping & E-Commerce', icon: 'ShoppingBag', color: '#ec4899', type: 'expense' },
  { id: 'cat-bills', name: 'Bills & Utilities', icon: 'Zap', color: '#eab308', type: 'expense' },
  { id: 'cat-entertainment', name: 'Entertainment & OTT', icon: 'Tv', color: '#8b5cf6', type: 'expense' },
  { id: 'cat-healthcare', name: 'Healthcare & Fitness', icon: 'HeartPulse', color: '#ef4444', type: 'expense' },
  { id: 'cat-education', name: 'Education & Courses', icon: 'GraduationCap', color: '#06b6d4', type: 'expense' },
  { id: 'cat-travel', name: 'Travel & Vacations', icon: 'Plane', color: '#14b8a6', type: 'expense' },
  { id: 'cat-subscriptions', name: 'Subscriptions & SaaS', icon: 'Repeat', color: '#6366f1', type: 'expense' },
  { id: 'cat-groceries', name: 'Groceries & Mart', icon: 'ShoppingCart', color: '#10b981', type: 'expense' },
  { id: 'cat-housing', name: 'Rent & Housing', icon: 'Home', color: '#84cc16', type: 'expense' },
  { id: 'cat-other-exp', name: 'Other Expenses', icon: 'CircleEllipsis', color: '#64748b', type: 'expense' },

  // Income Categories
  { id: 'cat-salary', name: 'Salary & Wages', icon: 'Briefcase', color: '#10b981', type: 'income' },
  { id: 'cat-freelance', name: 'Freelance & Consulting', icon: 'Laptop', color: '#3b82f6', type: 'income' },
  { id: 'cat-investment', name: 'Investments & Dividends', icon: 'TrendingUp', color: '#8b5cf6', type: 'income' },
  { id: 'cat-rental-inc', name: 'Rental Income', icon: 'Building', color: '#06b6d4', type: 'income' },
  { id: 'cat-bonus', name: 'Bonus & Incentives', icon: 'Award', color: '#f59e0b', type: 'income' },
  { id: 'cat-other-inc', name: 'Other Income', icon: 'Coins', color: '#64748b', type: 'income' },
];

export const CATEGORY_ICON_MAP: Record<string, string> = {
  Utensils: 'Utensils',
  Car: 'Car',
  ShoppingBag: 'ShoppingBag',
  Zap: 'Zap',
  Tv: 'Tv',
  HeartPulse: 'HeartPulse',
  GraduationCap: 'GraduationCap',
  Plane: 'Plane',
  Repeat: 'Repeat',
  ShoppingCart: 'ShoppingCart',
  Home: 'Home',
  CircleEllipsis: 'CircleEllipsis',
  Briefcase: 'Briefcase',
  Laptop: 'Laptop',
  TrendingUp: 'TrendingUp',
  Building: 'Building',
  Award: 'Award',
  Coins: 'Coins',
  CreditCard: 'CreditCard',
  ShieldCheck: 'ShieldCheck',
  Coffee: 'Coffee',
  Gift: 'Gift',
};
