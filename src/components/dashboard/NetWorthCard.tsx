import React from 'react';
import { ShieldCheck, TrendingUp, ArrowUpRight, ArrowDownRight, Building2, CreditCard } from 'lucide-react';
import { NetWorthData } from '../../types';

interface NetWorthCardProps {
  data?: NetWorthData;
  isLoading?: boolean;
}

export const NetWorthCard: React.FC<NetWorthCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />;
  }

  const netWorth = data?.total || 0;
  const assets = data?.assets || 0;
  const liabilities = data?.liabilities || 0;

  return (
    <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl shadow-indigo-950/20 border border-indigo-700/30">
      {/* Background ambient decorative glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full">
              Balance Sheet
            </span>
            <div className="flex items-center text-xs text-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>Real-Time Net Worth</span>
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-2 tracking-tight text-white">
            ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-300 block">Assets</span>
              <span className="text-sm font-bold text-emerald-300">
                ${assets.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-white/20" />

          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-300 block">Liabilities</span>
              <span className="text-sm font-bold text-rose-300">
                ${liabilities.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
