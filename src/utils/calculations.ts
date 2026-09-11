import { Transaction } from '../types/transaction';
import { Budget, BudgetProgress, BudgetStatus } from '../types/budget';
import { Goal } from '../types/goal';
import { parseISO, isSameMonth } from 'date-fns';

/**
 * Calculates total income from a list of transactions
 */
export function calculateIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates total expenses from a list of transactions
 */
export function calculateExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates net balance (Income - Expenses)
 */
export function calculateBalance(transactions: Transaction[]): number {
  return calculateIncome(transactions) - calculateExpenses(transactions);
}

/**
 * Calculates net savings (Income - Expenses)
 */
export function calculateSavings(transactions: Transaction[]): number {
  return calculateBalance(transactions);
}

/**
 * Calculates savings rate percentage: (Income - Expenses) / Income * 100
 * Handles division by zero safely
 */
export function calculateSavingsRate(transactions: Transaction[]): number {
  const income = calculateIncome(transactions);
  const expenses = calculateExpenses(transactions);
  if (income <= 0) return 0;
  const rate = ((income - expenses) / income) * 100;
  return Math.max(0, Math.min(100, Math.round(rate * 10) / 10));
}

/**
 * Calculates total spending grouped by category ID for expense transactions
 */
export function calculateCategoryTotals(
  transactions: Transaction[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === 'expense') {
      totals[t.category] = (totals[t.category] || 0) + (Number(t.amount) || 0);
    }
  }
  return totals;
}

/**
 * Filters transactions belonging to a specific Date month/year
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  targetDate: Date = new Date()
): Transaction[] {
  return transactions.filter((t) => {
    try {
      const txDate = parseISO(t.date);
      return isSameMonth(txDate, targetDate);
    } catch {
      return false;
    }
  });
}

/**
 * Calculates progress for each budget against current month's expenses
 */
export function calculateBudgetsProgress(
  budgets: Budget[],
  transactions: Transaction[],
  categories?: { id: string; name: string }[]
): BudgetProgress[] {
  const catIdToName = new Map(categories?.map((c) => [c.id, c.name.toLowerCase()]));
  const catNameToId = new Map(categories?.map((c) => [c.name.toLowerCase(), c.id]));

  return budgets.map((budget) => {
    const budgetCat = (budget.category || '').toLowerCase();
    const budgetId = catNameToId.get(budgetCat) || budget.category;
    const budgetName = catIdToName.get(budget.category) || budgetCat;

    const spent = transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const txCat = (t.category || '').toLowerCase();
        const txId = catNameToId.get(txCat) || t.category;
        const txName = catIdToName.get(t.category) || txCat;
        return (
          t.category === budget.category ||
          txCat === budgetCat ||
          txId === budgetId ||
          txName === budgetName ||
          (budget.categoryId &&
            (t.categoryId === budget.categoryId || t.category === budget.categoryId))
        );
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const limit = budget.monthlyLimit || 1;
    const percentage = Math.round((spent / limit) * 1000) / 10;
    const remaining = Math.max(0, limit - spent);

    let status: BudgetStatus = 'healthy';
    if (percentage >= 100) {
      status = 'danger';
    } else if (percentage >= 75) {
      status = 'warning';
    }

    return {
      budget,
      spent,
      remaining,
      percentage,
      status,
    };
  });
}

/**
 * Calculates progress and remaining requirement for a savings goal
 */
export function calculateGoalProgress(goal: Goal): {
  percentage: number;
  remainingAmount: number;
  monthlyNeeded: number;
  monthsLeft: number;
} {
  const target = goal.targetAmount || 1;
  const current = goal.currentAmount || 0;
  const percentage = Math.min(100, Math.round((current / target) * 1000) / 10);
  const remainingAmount = Math.max(0, target - current);

  // Calculate remaining months based on deadline
  let monthsLeft = 1;
  try {
    const deadlineDate = parseISO(goal.deadline);
    const now = new Date();
    const diffMonths =
      (deadlineDate.getFullYear() - now.getFullYear()) * 12 +
      (deadlineDate.getMonth() - now.getMonth());
    monthsLeft = Math.max(1, diffMonths);
  } catch {
    monthsLeft = 1;
  }

  const monthlyNeeded = Math.round(remainingAmount / monthsLeft);

  return {
    percentage,
    remainingAmount,
    monthlyNeeded,
    monthsLeft,
  };
}

/**
 * Calculates percentage change between current and previous period safely
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10;
}
