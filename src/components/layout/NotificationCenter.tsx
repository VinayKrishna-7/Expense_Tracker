import React from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
  Target,
  Repeat,
  Info,
} from 'lucide-react';
import { formatSmartDate } from '../../utils/formatters';
import { clsx } from 'clsx';
import { AppNotification } from '../../types/notification';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearNotification = useNotificationStore((s) => s.clearNotification);
  const clearAll = useNotificationStore((s) => s.clearAll);

  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'budget_alert':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'goal_reached':
        return <Target size={16} className="text-emerald-500" />;
      case 'recurring_due':
        return <Repeat size={16} className="text-brand-500" />;
      default:
        return <Info size={16} className="text-sky-500" />;
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    markAsRead(item.id);
    if (item.actionUrl) {
      navigate(item.actionUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-surface-900 shadow-2xl border-l border-surface-200 dark:border-surface-800 flex flex-col animate-slide-down">
          {/* Header */}
          <div className="p-5 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-surface-900 dark:text-white">
                  Notifications
                </h3>
                <p className="text-xs text-surface-400">
                  {notifications.filter((n) => !n.read).length} unread updates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <CheckCheck size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    title="Clear all"
                    className="p-1.5 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors ml-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800/60 p-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-surface-400">
                <Bell size={36} strokeWidth={1.5} className="mb-2 opacity-40" />
                <p className="text-sm font-semibold text-surface-600 dark:text-surface-300">
                  No notifications yet
                </p>
                <p className="text-xs mt-1">
                  Budget alerts and financial milestones will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={clsx(
                    'p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 my-1 relative group',
                    item.read
                      ? 'bg-transparent hover:bg-surface-50 dark:hover:bg-surface-800/40 opacity-75'
                      : 'bg-brand-50/40 dark:bg-brand-950/30 hover:bg-brand-50/70 border border-brand-100 dark:border-brand-900/40'
                  )}
                >
                  <div className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-surface-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-surface-400 shrink-0">
                        {formatSmartDate(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-surface-600 dark:text-surface-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-surface-400 hover:text-rose-500 rounded transition-opacity"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
