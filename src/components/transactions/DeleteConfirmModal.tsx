import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Transaction } from '../../types/transaction';
import { formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '../../store/useSettingsStore';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: Transaction | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
}) => {
  const currency = useSettingsStore((s) => s.settings.currency);

  if (!transaction) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="danger"
      confirmVariant="danger"
      confirmText="Delete Transaction"
      title="Delete transaction?"
      description={`Are you sure you want to delete "${transaction.title}" (${formatCurrency(
        transaction.amount,
        currency
      )})? You will have a brief window to undo this action.`}
    />
  );
};
