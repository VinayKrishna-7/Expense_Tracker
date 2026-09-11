import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Goal } from '../../types/goal';
import { useGoalStore } from '../../store/useGoalStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { CURRENCIES } from '../../constants/currencies';
import confetti from 'canvas-confetti';

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

export const AddContributionModal: React.FC<AddContributionModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addContribution = useGoalStore((s) => s.addContribution);
  const currencyCode = useSettingsStore((s) => s.settings.currency);
  const currencySymbol = CURRENCIES[currencyCode]?.symbol || '₹';
  const addToast = useToastStore((s) => s.addToast);

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    setIsSubmitting(true);
    const updated = addContribution(goal.id, Number(amount), notes || undefined);

    if (updated) {
      // Check if goal was just completed
      if (updated.currentAmount >= updated.targetAmount) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'],
        });
        addToast({
          message: `🎉 Milestone reached! You have achieved 100% of "${goal.title}"!`,
          type: 'success',
        });
      } else {
        addToast({
          message: `Deposit of ${currencySymbol}${amount.toLocaleString()} added to "${goal.title}"!`,
          type: 'success',
        });
      }
    }

    setIsSubmitting(false);
    setAmount('');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deposit towards "${goal.title}"`}
      description="Add a savings contribution to boost your milestone progress."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={`Deposit Amount (${currencySymbol})`}
          type="number"
          step="any"
          placeholder="5000"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value ? Number(e.target.value) : '');
            setError('');
          }}
          leftIcon={<span className="font-bold text-sm">{currencySymbol}</span>}
          error={error}
          autoFocus
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-400 mb-1.5">
            Contribution Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. September bonus allocation"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-sm p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-100 dark:border-surface-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Add Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
