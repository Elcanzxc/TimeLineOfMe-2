import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Card, CardContent } from '@/shared/ui/Card';
import { Loader2, Users, Database, Shield } from 'lucide-react';

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/stats');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Users className="w-10 h-10 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Database className="w-10 h-10 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Entries</p>
              <p className="text-3xl font-bold">{stats.totalEntries || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Shield className="w-10 h-10 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Roles</p>
              <p className="text-3xl font-bold">Admin, User</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
