export interface FinancialInsight {
  id: string;
  type: 'warning' | 'tip' | 'positive' | 'neutral';
  title: string;
  message: string;
  metric?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface FinancialHealthScore {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' | 'None';
  breakdown: {
    savingsRateScore: number;
    budgetDisciplineScore: number;
    liquidityBufferScore: number;
    debtRatioScore: number;
  };
  metrics: {
    savingsRatePercent: number;
    budgetAdherencePercent: number;
    monthsOfRunway: number;
    netWorth: number;
  };
}

export interface NetWorthData {
  total: number;
  assets: number;
  liabilities: number;
}

export interface SpendForecast {
  projectedMonthEndExpense: number;
  daysElapsed: number;
  daysRemaining: number;
  dailySpendVelocity: number;
}
