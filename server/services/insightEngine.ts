export interface Insight {
  id: string;
  type: 'warning' | 'tip' | 'positive' | 'neutral';
  title: string;
  message: string;
  metric?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface FinancialHealthScore {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' | 'None';
  breakdown: {
    savingsRateScore: number; // max 35
    budgetDisciplineScore: number; // max 25
    liquidityBufferScore: number; // max 20
    debtRatioScore: number; // max 20
  };
  metrics: {
    savingsRatePercent: number;
    budgetAdherencePercent: number;
    monthsOfRunway: number;
    netWorth: number;
  };
}

export interface InsightEngineInput {
  transactions: Array<{
    id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    date: string | Date;
    categoryId: string;
    categoryName?: string;
  }>;
  budgets: Array<{
    categoryId: string;
    categoryName?: string;
    monthlyLimit: number;
    currentSpent: number;
  }>;
  accounts: Array<{
    id: string;
    type: string;
    balance: number;
    isLiability?: boolean;
  }>;
  subscriptions: Array<{
    id: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly' | 'weekly';
    status: 'active' | 'cancelled' | 'paused';
  }>;
  currentDate?: Date;
}

export function generateFinancialInsights(input: InsightEngineInput): {
  insights: Insight[];
  healthScore: FinancialHealthScore;
  forecast: {
    projectedMonthEndExpense: number;
    daysElapsed: number;
    daysRemaining: number;
    dailySpendVelocity: number;
  };
} {
  const now = input.currentDate ? new Date(input.currentDate) : new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysElapsed = Math.max(1, dayOfMonth);
  const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);

  const insights: Insight[] = [];

  // 1. Separate current month transactions
  const currentMonthTx = input.transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const monthExpenses = currentMonthTx
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthIncome = currentMonthTx
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  // 2. Spending Velocity & Forecast
  const dailySpendVelocity = monthExpenses / daysElapsed;
  const projectedMonthEndExpense = Math.round(monthExpenses + dailySpendVelocity * daysRemaining);

  // 3. Weekend vs Weekday Spending Velocity
  let weekdayTotal = 0;
  let weekdayCount = 0;
  let weekendTotal = 0;
  let weekendCount = 0;

  currentMonthTx
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const day = new Date(tx.date).getDay();
      if (day === 0 || day === 6) {
        weekendTotal += Number(tx.amount);
        weekendCount++;
      } else {
        weekdayTotal += Number(tx.amount);
        weekdayCount++;
      }
    });

  const avgWeekdaySpend = weekdayCount > 0 ? weekdayTotal / weekdayCount : 0;
  const avgWeekendSpend = weekendCount > 0 ? weekendTotal / weekendCount : 0;

  if (avgWeekendSpend > avgWeekdaySpend * 1.6 && avgWeekendSpend > 50) {
    insights.push({
      id: 'weekend-velocity-spike',
      type: 'warning',
      title: 'Weekend Spending Spike',
      message: `Your average weekend transaction spend ($${avgWeekendSpend.toFixed(0)}) is ${(
        (avgWeekendSpend / (avgWeekdaySpend || 1) - 1) *
        100
      ).toFixed(0)}% higher than your weekday rate.`,
      metric: `+${((avgWeekendSpend / (avgWeekdaySpend || 1) - 1) * 100).toFixed(0)}%`,
    });
  }

  // 4. Budget Overrun & Forecast Warnings
  let overBudgetCategories = 0;
  let totalBudgetCategories = input.budgets.length;

  input.budgets.forEach((budget) => {
    const categorySpent = currentMonthTx
      .filter((tx) => tx.type === 'expense' && tx.categoryId === budget.categoryId)
      .reduce((s, tx) => s + Number(tx.amount), 0);

    const categoryVelocity = categorySpent / daysElapsed;
    const projectedCategoryExpense = categorySpent + categoryVelocity * daysRemaining;

    if (categorySpent > budget.monthlyLimit) {
      overBudgetCategories++;
      insights.push({
        id: `budget-exceeded-${budget.categoryId}`,
        type: 'warning',
        title: `Budget Exceeded: ${budget.categoryName || 'Category'}`,
        message: `You've exceeded your monthly budget of $${budget.monthlyLimit.toLocaleString()} by $${(categorySpent - budget.monthlyLimit).toLocaleString()}.`,
        metric: `${Math.round((categorySpent / budget.monthlyLimit) * 100)}% spent`,
        actionLabel: 'Adjust Budget',
        actionUrl: '/budgets',
      });
    } else if (
      projectedCategoryExpense > budget.monthlyLimit &&
      categorySpent > budget.monthlyLimit * 0.6
    ) {
      insights.push({
        id: `budget-forecast-warning-${budget.categoryId}`,
        type: 'tip',
        title: `Budget Pace Alert: ${budget.categoryName || 'Category'}`,
        message: `At current burn rate ($${categoryVelocity.toFixed(0)}/day), you are projected to reach $${projectedCategoryExpense.toFixed(0)} (limit: $${budget.monthlyLimit.toLocaleString()}).`,
        metric: `Pacing: ${Math.round((projectedCategoryExpense / budget.monthlyLimit) * 100)}%`,
        actionLabel: 'View Budget',
        actionUrl: '/budgets',
      });
    }
  });

  // 5. Subscription Burden
  const activeSubs = input.subscriptions.filter((s) => s.status === 'active');
  const monthlySubTotal = activeSubs.reduce((sum, s) => {
    if (s.billingCycle === 'yearly') return sum + s.amount / 12;
    if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
    return sum + s.amount;
  }, 0);

  if (monthIncome > 0) {
    const subBurdenPercent = (monthlySubTotal / monthIncome) * 100;
    if (subBurdenPercent > 12) {
      insights.push({
        id: 'subscription-burden-high',
        type: 'warning',
        title: 'High Subscription Burden',
        message: `Active subscriptions account for ${subBurdenPercent.toFixed(1)}% ($${monthlySubTotal.toFixed(0)}/mo) of your monthly income. Consider auditing unused services.`,
        metric: `${subBurdenPercent.toFixed(1)}% of income`,
        actionLabel: 'Audit Subscriptions',
        actionUrl: '/subscriptions',
      });
    } else if (monthlySubTotal > 0) {
      insights.push({
        id: 'subscription-burden-healthy',
        type: 'positive',
        title: 'Controlled Fixed Subscriptions',
        message: `Your active recurring subscriptions are well-managed at $${monthlySubTotal.toFixed(0)}/mo (${subBurdenPercent.toFixed(1)}% of income).`,
        metric: `$${monthlySubTotal.toFixed(0)}/mo`,
      });
    }
  }

  // 6. Net Worth & Financial Health Score Calculation
  const totalAssets = input.accounts
    .filter((a) => !a.isLiability && a.type !== 'credit_card' && a.type !== 'loan')
    .reduce((sum, a) => sum + Number(a.balance), 0);

  const totalLiabilities = input.accounts
    .filter((a) => a.isLiability || a.type === 'credit_card' || a.type === 'loan')
    .reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0);

  const netWorth = totalAssets - totalLiabilities;

  const hasFinancialData =
    input.transactions.length > 0 ||
    totalAssets > 0 ||
    totalLiabilities > 0 ||
    input.budgets.length > 0;

  if (!hasFinancialData) {
    return {
      insights: [],
      healthScore: {
        score: 0,
        grade: 'None',
        breakdown: {
          savingsRateScore: 0,
          budgetDisciplineScore: 0,
          liquidityBufferScore: 0,
          debtRatioScore: 0,
        },
        metrics: {
          savingsRatePercent: 0,
          budgetAdherencePercent: 0,
          monthsOfRunway: 0,
          netWorth: 0,
        },
      },
      forecast: {
        projectedMonthEndExpense: 0,
        daysElapsed,
        daysRemaining,
        dailySpendVelocity: 0,
      },
    };
  }

  // Savings Rate Score (0 - 35)
  let savingsRatePercent = 0;
  let savingsRateScore = 0;
  if (monthIncome > 0) {
    const netSavings = monthIncome - monthExpenses;
    savingsRatePercent = Math.max(0, (netSavings / monthIncome) * 100);
    // 20% savings rate gives full score 35, linear from 0 to 20%
    savingsRateScore = Math.min(35, Math.round((savingsRatePercent / 20) * 35));
  } else {
    savingsRateScore = 15; // default neutral if transactions exist but no income logged yet
  }

  // Budget Discipline Score (0 - 25)
  let budgetAdherencePercent = 100;
  let budgetDisciplineScore = 25;
  if (totalBudgetCategories > 0) {
    budgetAdherencePercent = Math.round(
      ((totalBudgetCategories - overBudgetCategories) / totalBudgetCategories) * 100
    );
    budgetDisciplineScore = Math.round((budgetAdherencePercent / 100) * 25);
  }

  // Liquidity Buffer Score (0 - 20)
  // Liquid cash runway = total liquid assets / monthly expense
  const monthlyBurn = monthExpenses > 0 ? monthExpenses : 1000;
  const monthsOfRunway = totalAssets / monthlyBurn;
  // 6 months runway gives full score 20
  const liquidityBufferScore = Math.min(20, Math.round((monthsOfRunway / 6) * 20));

  // Debt Ratio Score (0 - 20)
  let debtRatioScore = 20;
  if (totalAssets > 0) {
    const debtRatio = totalLiabilities / totalAssets;
    if (debtRatio <= 0.1) debtRatioScore = 20;
    else if (debtRatio <= 0.3) debtRatioScore = 16;
    else if (debtRatio <= 0.5) debtRatioScore = 10;
    else debtRatioScore = 5;
  } else if (totalLiabilities > 0) {
    debtRatioScore = 0;
  }

  const totalScore = Math.min(
    100,
    Math.max(0, savingsRateScore + budgetDisciplineScore + liquidityBufferScore + debtRatioScore)
  );

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 55) grade = 'C';
  else if (totalScore >= 40) grade = 'D';
  else grade = 'F';

  // Add Health Score Insight if good
  if (totalScore >= 80) {
    insights.push({
      id: 'high-financial-health',
      type: 'positive',
      title: `Excellent Financial Health (${grade})`,
      message: `Your savings discipline, debt management, and liquidity runway place your financial health score at ${totalScore}/100.`,
      metric: `${totalScore}/100`,
    });
  }

  return {
    insights,
    healthScore: {
      score: totalScore,
      grade,
      breakdown: {
        savingsRateScore,
        budgetDisciplineScore,
        liquidityBufferScore,
        debtRatioScore,
      },
      metrics: {
        savingsRatePercent: Math.round(savingsRatePercent),
        budgetAdherencePercent,
        monthsOfRunway: Number(monthsOfRunway.toFixed(1)),
        netWorth,
      },
    },
    forecast: {
      projectedMonthEndExpense,
      daysElapsed,
      daysRemaining,
      dailySpendVelocity: Math.round(dailySpendVelocity),
    },
  };
}
