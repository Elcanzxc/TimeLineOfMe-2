import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/Card';
import { apiClient } from '@/shared/api/apiClient';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type ResetPasswordForm = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema)
  });

  if (!email || !token) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6 text-destructive font-medium">
          Invalid reset link.
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordForm) => {
    setError(null);
    try {
      await apiClient.post('/api/auth/reset-password', {
        email,
        token,
        newPassword: data.password
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="bg-green-500/10 text-green-600 p-4 rounded-md text-center space-y-4 font-medium">
              <p>Your password has been successfully reset!</p>
              <Button asChild className="w-full">
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              
              {error && <div className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded">{error}</div>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
