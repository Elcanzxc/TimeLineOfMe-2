import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '@/shared/api/apiClient';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (!userId || !token) {
      setStatus('error');
      return;
    }

    apiClient.get('/api/auth/confirm-email', { params: { userId, token } })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Email Confirmation</CardTitle>
          <CardDescription>We are verifying your email address.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 space-y-6">
          {status === 'loading' && (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium">Your email has been confirmed!</p>
              <Button asChild className="w-full">
                <Link to="/login">Go to Login</Link>
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-lg font-medium">Invalid or expired token.</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/register">Register Again</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
