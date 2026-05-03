import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/Card';
import { apiClient } from '@/shared/api/apiClient';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null);
    try {
      await apiClient.post('/api/auth/forgot-password', data);
      setIsSubmitted(true);
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email and we will send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="bg-primary/10 p-4 rounded-md text-center space-y-4">
              <p className="text-primary font-medium">Reset link sent!</p>
              <p className="text-sm">Please check your inbox (and spam folder).</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              
              {error && <div className="text-sm text-destructive font-medium">{error}</div>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full text-muted-foreground">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
