import { create } from 'zustand';
import { apiClient } from '@/shared/api/apiClient';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actorId?: string;
  actorUsername?: string;
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
  connection: HubConnection | null;
  connectSignalR: (token: string) => Promise<void>;
  disconnectSignalR: () => void;
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

  connection: null,

  connectSignalR: async (token: string) => {
    if (get().connection) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5170')}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    // Set connection immediately to prevent double-connections during React StrictMode double mounts
    set({ connection });

    connection.on('ReceiveNotification', (notification: AppNotification) => {
      get().addNotification(notification);
      // Show toast on new notification
      toast(notification.message, {
        description: 'New notification',
        duration: 5000,
      });
    });

    try {
      await connection.start();
      console.log('SignalR connected');
    } catch (err) {
      console.error('SignalR connection failed:', err);
      set({ connection: null });
    }
  },

  disconnectSignalR: () => {
    const conn = get().connection;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.stop();
      set({ connection: null });
      console.log('SignalR disconnected');
    }
  }
}));
