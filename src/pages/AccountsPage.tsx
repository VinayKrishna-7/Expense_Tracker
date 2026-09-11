import React, { useState } from 'react';
import {
  Building2,
  Wallet,
  CreditCard,
  Plus,
  ArrowRightLeft,
  Smartphone,
  TrendingUp,
  ShieldCheck,
  MoreVertical,
  Trash2,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { useAccounts } from '../hooks/useFinancialQueries';
import { Account, AccountType } from '../types';
import { AccountModal } from '../components/accounts/AccountModal';
import { TransferModal } from '../components/accounts/TransferModal';

export const AccountsPage: React.FC = () => {
  const {
    accounts,
    isLoading,
    createAccount,
    updateAccount,
    deleteAccount,
    transferAccounts,
  } = useAccounts();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'checking':
        return <Building2 className="w-5 h-5" />;
      case 'savings':
        return <Wallet className="w-5 h-5" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />;
      case 'upi':
        return <Smartphone className="w-5 h-5" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const filteredAccounts = accounts.filter(
    (acc) => selectedType === 'all' || acc.type === selectedType
  );

  const totalAssets = accounts
    .filter((a) => !a.isLiability && a.type !== 'credit_card' && a.type !== 'loan')
    .reduce((sum, a) => sum + Number(a.balance), 0);

  const totalLiabilities = accounts
    .filter((a) => a.isLiability || a.type === 'credit_card' || a.type === 'loan')
    .reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0);

  const netWorth = totalAssets - totalLiabilities;

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setIsAccountModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete account');
      }
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Accounts & Wallets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your banking, credit lines, investment portfolios, and digital wallets.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {accounts.length >= 2 && (
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm transition"
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
              <span>Transfer Funds</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* KPI Balance Sheet Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-500/10">
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">
            Total Net Worth
          </span>
          <div className="text-3xl font-extrabold mt-1 tracking-tight">
            ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center text-xs text-indigo-100">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-300" />
            <span>Assets minus liabilities</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
            Liquid Assets
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Checking, savings, cash & investments
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400">
            Total Debt / Liabilities
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Credit cards & active loans
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'all', label: 'All Accounts' },
          { id: 'checking', label: 'Checking' },
          { id: 'savings', label: 'Savings' },
          { id: 'credit_card', label: 'Credit Cards' },
          { id: 'investment', label: 'Investments' },
          { id: 'upi', label: 'UPI / Wallets' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              selectedType === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accounts List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No accounts found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Get started by adding your bank accounts, credit cards, or digital wallets.
          </p>
          <button
            onClick={() => {
              setEditingAccount(null);
              setIsAccountModalOpen(true);
            }}
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccounts.map((acc) => {
            const isLiability = acc.isLiability || acc.type === 'credit_card';
            return (
              <div
                key={acc.id}
                className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="p-3 rounded-xl text-white shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: acc.color || '#4F46E5' }}
                    >
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                          {acc.name}
                        </h3>
                        {acc.isDefault && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {acc.institution || acc.type.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === acc.id ? null : acc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === acc.id && (
                      <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="w-full flex items-center px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="w-full flex items-center px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {isLiability ? 'Current Balance Owed' : 'Available Balance'}
                    </span>
                    <div
                      className={`text-2xl font-bold tracking-tight mt-0.5 ${
                        isLiability
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      ${Math.abs(acc.balance).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  {acc.creditLimit && (
                    <div className="text-right">
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        Limit
                      </span>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                        ${acc.creditLimit.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={async (data) => {
          if (editingAccount) {
            await updateAccount({ id: editingAccount.id, updates: data });
          } else {
            await createAccount(data);
          }
        }}
        initialData={editingAccount}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onTransfer={transferAccounts}
      />
    </div>
  );
};
