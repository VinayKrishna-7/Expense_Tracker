import React from 'react';
import { AlertTriangle, Lightbulb, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FinancialInsight } from '../../types';
import { useTransactionStore } from '../../store/useTransactionStore';

interface InsightsFeedProps {
  insights?: FinancialInsight[];
  isLoading?: boolean;
}

export const InsightsFeed: React.FC<InsightsFeedProps> = ({ insights = [], isLoading }) => {
  const hasTransactions = useTransactionStore((s) => s.transactions.length > 0);

  if (isLoading) {
    return <div className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />;
  }

  if (insights.length === 0) {
    if (!hasTransactions) {
      return (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No Insights Yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add transactions and budgets to generate real-time AI & rule-based financial insights.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">All Metrics On Track</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            No anomalous spikes or budget overruns detected for this period.
          </p>
        </div>
      </div>
    );
  }

  const getInsightIcon = (type: FinancialInsight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-indigo-500" />;
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getInsightBg = (type: FinancialInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20';
      case 'tip':
        return 'border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20';
      case 'positive':
        return 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20';
      default:
        return 'border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          AI & Rule-Based Financial Insights
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full">
          {insights.length} active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-xl border transition flex flex-col justify-between ${getInsightBg(
              insight.type
            )}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {insight.title}
                  </h4>
                </div>
                {insight.metric && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 shadow-2xs">
                    {insight.metric}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {insight.message}
              </p>
            </div>

            {insight.actionLabel && insight.actionUrl && (
              <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                <Link
                  to={insight.actionUrl}
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
                >
                  <span>{insight.actionLabel}</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
