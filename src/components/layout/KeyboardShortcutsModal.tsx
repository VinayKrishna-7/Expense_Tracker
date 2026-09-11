import React from 'react';
import { Modal } from '../ui/Modal';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcuts = [
    { key: 'Cmd/Ctrl + K', description: 'Open command palette' },
    { key: 'N', description: 'Create new transaction' },
    { key: '/', description: 'Focus search bar' },
    { key: 'D', description: 'Navigate to Dashboard' },
    { key: 'T', description: 'Navigate to Transactions' },
    { key: 'B', description: 'Navigate to Budgets' },
    { key: 'A', description: 'Navigate to Analytics' },
    { key: 'G', description: 'Navigate to Goals' },
    { key: 'S', description: 'Navigate to Settings' },
    { key: '?', description: 'Open this shortcuts help' },
    { key: 'Esc', description: 'Close modals / dropdowns' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Quickly navigate and manage your finances with hotkeys."
      maxWidth="md"
    >
      <div className="divide-y divide-surface-100 dark:divide-surface-800">
        {shortcuts.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2.5 text-xs"
          >
            <span className="text-surface-700 dark:text-surface-300 font-medium">
              {s.description}
            </span>
            <kbd className="px-2.5 py-1 font-mono font-bold text-surface-800 dark:text-surface-200 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-subtle">
              {s.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
};
