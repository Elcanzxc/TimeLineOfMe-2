import { create } from 'zustand';
import { apiClient } from '@/shared/api/apiClient';

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actorId?: string;
  entityId?: string;
  entityType?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: AppNotification) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setNotifications: (notifications: AppNotification[]) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      // Assuming the backend returns { items: [...] }
      const res = await apiClient.get('/api/notifications');
      get().setNotifications(res.data.items || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.put(`/api/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.put('/api/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  },

  clear: () => set({ notifications: [], unreadCount: 0 }),
}));
