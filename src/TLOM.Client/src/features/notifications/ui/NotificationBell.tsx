import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Loader2, UserPlus, Heart, MessageSquare, Info } from 'lucide-react';
import { useNotificationStore, type AppNotification } from '../store/useNotificationStore';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NewFollower': return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'EntryLiked': return <Heart className="h-4 w-4 text-red-500" />;
    case 'NewComment': return <MessageSquare className="h-4 w-4 text-green-500" />;
    default: return <Info className="h-4 w-4 text-muted-foreground" />;
  }
}

function formatNotificationDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationMessage(notification: AppNotification, t: (key: string) => string): string {
  const actor = notification.actorUsername ? `@${notification.actorUsername}` : '';
  
  switch (notification.type) {
    case 'NewFollower':
      if (notification.message.includes('отписался')) {
        return actor ? `${actor} ${t('notifications.unfollowed')}` : t('notifications.unfollowed');
      }
      return actor ? `${actor} ${t('notifications.followed')}` : t('notifications.followed');
    case 'EntryLiked':
      return actor ? `${actor} ${t('notifications.liked')}` : t('notifications.liked');
    case 'NewComment':
      return actor ? `${actor} ${t('notifications.commented')}` : t('notifications.commented');
    default:
      return notification.message;
  }
}

export function NotificationBell() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'NewFollower':
        // Navigate to the actor's profile (the person who followed/unfollowed)
        if (notification.actorUsername) {
          navigate(`/users/${notification.actorUsername}`);
        }
        break;
      case 'EntryLiked':
      case 'NewComment':
        // Navigate to the entry
        if (notification.entityId) {
          navigate(`/entry/${notification.entityId}`);
        }
        break;
      default:
        break;
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
                <h3 className="font-semibold">{t('notifications.title')}</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} className="text-xs h-8 px-2 text-primary">
                    <Check className="h-3 w-3 mr-1" /> {t('notifications.mark_all_read')}
                  </Button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {t('notifications.empty')}
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50 ${
                          !notification.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'text-muted-foreground'}`}>
                              {getNotificationMessage(notification, t)}
                            </p>
                            <span className="text-[10px] text-muted-foreground mt-1 block">
                              {formatNotificationDate(notification.createdAt)}
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
                <span className="text-xs text-muted-foreground">{t('notifications.end')}</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
