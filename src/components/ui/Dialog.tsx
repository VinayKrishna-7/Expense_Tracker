import React from 'react';
import { Modal } from './Modal';
import { Button, ButtonVariant } from './Button';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariant;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
  type = 'warning',
}) => {
  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    info: <Info className="w-6 h-6 text-brand-500" />,
  };

  const iconBg = {
    danger: 'bg-rose-50 dark:bg-rose-950/50',
    warning: 'bg-amber-50 dark:bg-amber-950/50',
    info: 'bg-brand-50 dark:bg-brand-950/50',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${iconBg[type]}`}>
          {icons[type]}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-surface-900 dark:text-surface-50">
            {title}
          </h4>
          <p className="mt-1.5 text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
