import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { TransactionCard } from '../transactions/TransactionCard';
import { useTransactionStore } from '../../store/useTransactionStore';
import { Transaction } from '../../types/transaction';
import { ArrowRight, Receipt } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface RecentTransactionsProps {
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onDuplicate: (tx: Transaction) => void;
  onNewTransaction: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  onEdit,
  onDelete,
  onDuplicate,
  onNewTransaction,
}) => {
  const navigate = useNavigate();
  const transactions = useTransactionStore((s) => s.transactions);

  // Take top 5 most recent
  const recentList = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-surface-900 dark:text-white">
            Recent Transactions
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Your latest financial activity
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/transactions')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          <span>View all</span>
          <ArrowRight size={14} />
        </button>
      </CardHeader>

      <CardContent className="pt-2">
        {recentList.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Start tracking your cash flow by logging your first transaction."
            actionLabel="+ Add Transaction"
            onAction={onNewTransaction}
          />
        ) : (
          <div className="space-y-2.5">
            {recentList.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
