import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Loader2, UserCog } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';

export function UsersManagementPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', page],
    queryFn: async () => {
      const res = await apiClient.get(`/api/admin/users?page=${page}&pageSize=20`);
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCog className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">Users Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.map((user: any) => (
                  <tr key={user.id} className="border-b border-border bg-card">
                    <td className="px-6 py-4 font-mono text-xs">{user.id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold text-xs">
                        {user.roleName || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => alert('Change role logic here')}>Change Role</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm font-medium">Page {page} of {data?.totalPages || 1}</span>
            <Button variant="outline" disabled={!data?.hasNextPage} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
