import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Shield, Activity, Users, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

export function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || user?.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Shield className="w-6 h-6" />
            TLOM Admin
          </div>
          <ThemeToggle />
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/admin">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}>
              <Shield className="w-5 h-5" />
              Dashboard
            </div>
          </Link>
          <Link to="/admin/users">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/users') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}>
              <Users className="w-5 h-5" />
              Users Management
            </div>
          </Link>
          <Link to="/admin/audit">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/audit') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}>
              <Activity className="w-5 h-5" />
              Audit Logs
            </div>
          </Link>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full justify-start">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
