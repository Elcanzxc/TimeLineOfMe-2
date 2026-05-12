import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuthStore();
  const { connectSignalR, disconnectSignalR, fetchNotifications, clear } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSignalR();
      clear();
      return;
    }

    // Fetch initial notification history
    fetchNotifications();

    // Connect SignalR through the store so all pages can listen to events
    connectSignalR(accessToken);

    return () => {
      disconnectSignalR();
    };
  }, [isAuthenticated, accessToken, connectSignalR, disconnectSignalR, fetchNotifications, clear]);

  return <>{children}</>;
}
