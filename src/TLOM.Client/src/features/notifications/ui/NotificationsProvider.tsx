import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotificationStore, type AppNotification } from '../store/useNotificationStore';

const HUB_URL = import.meta.env.VITE_HUB_URL || 'http://localhost:5170/hubs/notifications';

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuthStore();
  const { addNotification, fetchNotifications, clear } = useNotificationStore();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      // Clean up connection if logged out
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      clear();
      return;
    }

    // Fetch initial history
    fetchNotifications();

    // Create Hub connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Start connection
    connection
      .start()
      .then(() => console.log('SignalR Connected.'))
      .catch((err) => console.error('SignalR Connection Error: ', err));

    // Listen to events from Backend
    connection.on('ReceiveNotification', (notification: AppNotification) => {
      console.log('New notification received:', notification);
      addNotification(notification);
      
      // Optional: show a browser toast here using react-hot-toast or similar
    });

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken, addNotification, fetchNotifications, clear]);

  return <>{children}</>;
}
