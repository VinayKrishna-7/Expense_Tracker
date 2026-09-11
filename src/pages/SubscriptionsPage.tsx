import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Calendar,
  DollarSign,
  AlertCircle,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit2,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import { useSubscriptions } from '../hooks/useFinancialQueries';
import { Subscription, SubscriptionStatus } from '../types';
import { SubscriptionModal } from '../components/subscriptions/SubscriptionModal';

export const SubscriptionsPage: React.FC = () => {
  const {
    subscriptions,
    summary,
    isLoading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  } = useSubscriptions();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filtered = subscriptions.filter(
    (s) => filterStatus === 'all' || s.status === filterStatus
  );

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
    }
    setActiveMenuId(null);
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-full">
            <PauseCircle className="w-3 h-3 mr-1" /> Paused
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscriptions & Recurring Bills
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track recurring SaaS tools, media subscriptions, memberships, and renewal schedules.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSub(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-500/10">
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">
            Monthly Commitment
          </span>
          <div className="text-3xl font-extrabold mt-1 tracking-tight">
            ${summary.totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-sm font-normal text-indigo-200 ml-1">/mo</span>
          </div>
          <p className="text-xs text-indigo-100 mt-2">
            Normalized across all active billing cycles
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            Annual Run-Rate
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ${summary.totalYearly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal text-slate-400 ml-1">/yr</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Projected 12-month fixed outflow
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            Active Subscriptions
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {summary.activeCount} <span className="text-xs font-normal text-slate-400">of {summary.totalCount} total</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {summary.activeCount > 8 ? 'Consider auditing unused subscriptions' : 'Healthy subscription portfolio'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'all', label: 'All Subscriptions' },
          { id: 'active', label: 'Active' },
          { id: 'paused', label: 'Paused' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              filterStatus === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subscription List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Repeat className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No subscriptions tracked</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Never be surprised by recurring charges. Add your streaming services, software licenses, or memberships.
          </p>
          <button
            onClick={() => {
              setEditingSub(null);
              setIsModalOpen(true);
            }}
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((sub) => {
            const nextDate = new Date(sub.nextBillingDate);
            const daysUntil = Math.ceil(
              (nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={sub.id}
                className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {sub.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                          {sub.name}
                        </h3>
                        {sub.website && (
                          <a
                            href={sub.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-indigo-500 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(sub.status)}
                        <span className="text-xs text-slate-400 capitalize font-medium">
                          {sub.billingCycle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === sub.id ? null : sub.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === sub.id && (
                      <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs">
                        <button
                          onClick={() => handleEdit(sub)}
                          className="w-full flex items-center px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="w-full flex items-center px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Renewal In
                    </span>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      {daysUntil > 0
                        ? `${daysUntil} days (${nextDate.toLocaleDateString()})`
                        : daysUntil === 0
                        ? 'Due Today'
                        : `Overdue by ${Math.abs(daysUntil)} days`}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      ${sub.amount.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">
                      per {sub.billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSub(null);
        }}
        onSave={async (data) => {
          if (editingSub) {
            await updateSubscription({ id: editingSub.id, updates: data });
          } else {
            await createSubscription(data);
          }
        }}
        initialData={editingSub}
      />
    </div>
  );
};
