export type BudgetStatus = 'healthy' | 'warning' | 'danger';

export interface Budget {
  id: string;
  category: string;
  categoryId?: string;
  monthlyLimit: number;
  period: string; // e.g. "2026-09"
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}
