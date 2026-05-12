import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { apiClient } from '@/shared/api/apiClient';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AuthLayout } from './AuthLayout';
import { Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { t } = useTranslation();

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const schema = z.object({
    password: z.string().min(6, t('auth.validation.password_min')),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: t('auth.validation.passwords_mismatch'),
    path: ["confirmPassword"]
  });

  type ResetPasswordForm = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema)
  });

  // Invalid link
  if (!email || !token) {
    return (
      <AuthLayout mode="login">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 py-8"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <KeyRound className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-extrabold">{t('auth.reset_password.invalid_link')}</h2>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl text-base font-semibold group">
            <Link to="/forgot-password">
              {t('auth.forgot_password.title')}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </AuthLayout>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <AuthLayout mode="login">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center shadow-lg shadow-green-500/10">
              <ShieldCheck className="h-10 w-10 text-green-500" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-2xl font-extrabold mb-2">{t('auth.reset_password.success')}</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button asChild className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 group">
              <Link to="/login">
                {t('auth.reset_password.go_login')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </AuthLayout>
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
      setError(err.response?.data?.message || t('auth.reset_password.error'));
    }
  };

  return (
    <AuthLayout mode="login">
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-2">
          <div className="lg:hidden mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-xl px-4 py-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Time Line Of Me</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('auth.reset_password.title')}</h1>
          <p className="text-muted-foreground text-base">{t('auth.reset_password.subtitle')}</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground/80">{t('auth.reset_password.new_password')}</label>
            <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                focusedField === 'password' ? 'text-primary' : 'text-muted-foreground/50'
              }`} />
              <input
                type="password"
                {...register('password')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full h-12 pl-11 pr-4 rounded-xl border bg-background text-sm transition-all duration-200 outline-none
                  ${errors.password
                    ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
                    : 'border-input hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
            </div>
            {errors.password && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />{errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground/80">{t('auth.reset_password.confirm_password')}</label>
            <div className={`relative transition-all duration-300 ${focusedField === 'confirm' ? 'scale-[1.01]' : ''}`}>
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                focusedField === 'confirm' ? 'text-primary' : 'text-muted-foreground/50'
              }`} />
              <input
                type="password"
                {...register('confirmPassword')}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                className={`w-full h-12 pl-11 pr-4 rounded-xl border bg-background text-sm transition-all duration-200 outline-none
                  ${errors.confirmPassword
                    ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
                    : 'border-input hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
            </div>
            {errors.confirmPassword && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />{errors.confirmPassword.message}
              </motion.p>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </motion.div>
          )}

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  {t('auth.reset_password.submit')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </AuthLayout>
  );
}
