import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 md:w-96 z-50 origin-top-right"
          >
            <Card className="shadow-lg border overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} className="text-xs h-8 px-2 text-primary">
                    <Check className="h-3 w-3 mr-1" /> Mark all read
                  </Button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    You have no notifications yet.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                        className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50 ${
                          !notification.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                            <span className="text-[10px] text-muted-foreground mt-1 block">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-2 border-t bg-muted/20 text-center">
                <span className="text-xs text-muted-foreground">End of notifications</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
