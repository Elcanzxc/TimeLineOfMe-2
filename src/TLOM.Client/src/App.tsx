import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './features/auth/store/useAuthStore';
import { Button } from './shared/ui/Button';
import { NotificationBell } from './features/notifications/ui/NotificationBell';
import { ThemeToggle } from './shared/ui/ThemeToggle';
import { LanguageToggle } from './shared/ui/LanguageToggle';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useNotificationStore } from './features/notifications/store/useNotificationStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { fetchNotifications, connectSignalR, disconnectSignalR } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchNotifications();
      connectSignalR(accessToken);
    } else {
      disconnectSignalR();
    }
    return () => {
      disconnectSignalR();
    };
  }, [isAuthenticated, accessToken, fetchNotifications, connectSignalR, disconnectSignalR]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <header className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link to={isAuthenticated ? "/feed" : "/"}>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Time Line Of Me
          </h1>
        </Link>
        <nav className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              <Link to="/feed" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.feed')}</Link>
              <Link to="/search" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.search')}</Link>
              <Link to="/timeline" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.timeline')}</Link>
              <Link to="/users" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.find_friends')}</Link>
              <NotificationBell />
              <Link to={`/users/${useAuthStore.getState().user?.username}`} className="text-sm font-medium hover:text-primary transition-colors">My Profile</Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>{t('nav.logout')}</Button>
            </>
          ) : (
            <Link to="/login" className="hover:text-primary transition-colors font-medium">{t('nav.login')}</Link>
          )}
          
          <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Toaster position="bottom-right" richColors theme="system" />
    </div>
  );
}

export default App;
