import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutHandlers {
  onNewTransaction?: () => void;
  onOpenSearch?: () => void;
  onToggleCommandPalette?: () => void;
  onToggleHelp?: () => void;
  onCloseModals?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // Global Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onToggleCommandPalette?.();
        return;
      }

      // Escape key to close modals or search
      if (e.key === 'Escape') {
        handlers.onCloseModals?.();
        return;
      }

      // Avoid triggering single-key shortcuts when typing inside form inputs
      if (isInput) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          handlers.onNewTransaction?.();
          break;
        case '/':
          e.preventDefault();
          handlers.onOpenSearch?.();
          break;
        case 'd':
          e.preventDefault();
          navigate('/dashboard');
          break;
        case 't':
          e.preventDefault();
          navigate('/transactions');
          break;
        case 'b':
          e.preventDefault();
          navigate('/budgets');
          break;
        case 'a':
          e.preventDefault();
          navigate('/analytics');
          break;
        case 'g':
          e.preventDefault();
          navigate('/goals');
          break;
        case 's':
          e.preventDefault();
          navigate('/settings');
          break;
        case '?':
          e.preventDefault();
          handlers.onToggleHelp?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, handlers]);
}
