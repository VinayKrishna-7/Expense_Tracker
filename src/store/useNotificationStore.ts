import { create } from 'zustand';
import { AppNotification } from '../types/notification';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { AuthService } from '../services/authService';

interface NotificationState {
  notifications: AppNotification[];
  loadUserNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

function getNotificationStorageKey(): string {
  const user = AuthService.getCurrentUser();
  const userId = user ? user.id : 'usr-demo-001';
  return STORAGE_KEYS.getUserNotificationsKey(userId);
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  const getInitial = () => {
    return StorageService.getItem<AppNotification[]>(
      getNotificationStorageKey(),
      []
    );
  };

  const persist = (items: AppNotification[]) => {
    StorageService.setItem(getNotificationStorageKey(), items);
  };

  return {
    notifications: getInitial(),

    loadUserNotifications: () => {
      set({ notifications: getInitial() });
    },

    addNotification: (notif) => {
      const newNotif: AppNotification = {
        ...notif,
        id: `notif-${Date.now()}`,
        read: false,
        timestamp: new Date().toISOString(),
      };
      set((state) => {
        const next = [newNotif, ...state.notifications];
        persist(next);
        return { notifications: next };
      });
    },
    markAsRead: (id) =>
      set((state) => {
        const next = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        persist(next);
        return { notifications: next };
      }),
    markAllAsRead: () =>
      set((state) => {
        const next = state.notifications.map((n) => ({ ...n, read: true }));
        persist(next);
        return { notifications: next };
      }),
    clearNotification: (id) =>
      set((state) => {
        const next = state.notifications.filter((n) => n.id !== id);
        persist(next);
        return { notifications: next };
      }),
    clearAll: () => {
      persist([]);
      set({ notifications: [] });
    },
    unreadCount: () => {
      return get().notifications.filter((n) => !n.read).length;
    },
  };
});
