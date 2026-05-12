import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Loader2, Activity } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: async () => {
      const res = await apiClient.get(`/api/admin/audit-logs?page=${page}&pageSize=20`);
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">System Audit Logs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Account ID</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Entity Type</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.map((log: any) => (
                  <tr key={log.id} className="border-b border-border bg-card">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-xs">{log.accountId}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{log.action}</td>
                    <td className="px-6 py-4">{log.entityType}</td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Old: ${log.oldValues}\nNew: ${log.newValues}`)}>View JSON</Button>
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
