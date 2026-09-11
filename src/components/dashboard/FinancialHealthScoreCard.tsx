import React from 'react';
import { Award, ShieldAlert, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { FinancialHealthScore } from '../../types';

interface FinancialHealthScoreCardProps {
  healthScore?: FinancialHealthScore;
  isLoading?: boolean;
}

export const FinancialHealthScoreCard: React.FC<FinancialHealthScoreCardProps> = ({
  healthScore,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />;
  }

  const score = healthScore?.score || 78;
  const grade = healthScore?.grade || 'B';
  const breakdown = healthScore?.breakdown || {
    savingsRateScore: 25,
    budgetDisciplineScore: 25,
    liquidityBufferScore: 15,
    debtRatioScore: 15,
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500';
    if (s >= 65) return 'text-indigo-600 dark:text-indigo-400 border-indigo-500';
    if (s >= 50) return 'text-amber-500 border-amber-500';
    return 'text-rose-500 border-rose-500';
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            FinTech Health Score
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Grade {grade} ({score}/100)
          </h3>
        </div>
        <div
          className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-base ${getScoreColor(
            score
          )}`}
        >
          {grade}
        </div>
      </div>

      <div className="space-y-2.5 mt-4">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            <span>Savings Velocity</span>
            <span>{breakdown.savingsRateScore}/35</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(breakdown.savingsRateScore / 35) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            <span>Budget Discipline</span>
            <span>{breakdown.budgetDisciplineScore}/25</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(breakdown.budgetDisciplineScore / 25) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            <span>Liquidity Runway</span>
            <span>{breakdown.liquidityBufferScore}/20</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(breakdown.liquidityBufferScore / 20) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            <span>Debt-to-Asset Ratio</span>
            <span>{breakdown.debtRatioScore}/20</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(breakdown.debtRatioScore / 20) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
