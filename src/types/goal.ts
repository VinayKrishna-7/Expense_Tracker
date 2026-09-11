export interface GoalContribution {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category?: string;
  color?: string;
  icon?: string;
  contributions: GoalContribution[];
  isCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}
