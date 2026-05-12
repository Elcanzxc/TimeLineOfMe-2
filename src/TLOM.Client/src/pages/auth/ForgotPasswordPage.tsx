import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { apiClient } from '@/shared/api/apiClient';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AuthLayout } from './AuthLayout';
import { Mail, ArrowRight, Loader2, AlertCircle, MailCheck } from 'lucide-react';

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { t } = useTranslation();

  const schema = z.object({
    email: z.string().email(t('auth.validation.email_invalid')),
  });

  type ForgotPasswordForm = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null);
    try {
      await apiClient.post('/api/auth/forgot-password', data);
      setIsSubmitted(true);
    } catch {
      setError(t('auth.forgot_password.error'));
    }
  };

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
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <MailCheck className="h-10 w-10 text-primary" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-2xl font-extrabold mb-2">{t('auth.forgot_password.success_title')}</h2>
            <p className="text-muted-foreground text-sm">{t('auth.forgot_password.success_desc')}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button asChild className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 group">
              <Link to="/login">
                {t('auth.forgot_password.back_to_login')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </AuthLayout>
    );
  }

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
          <h1 className="text-3xl font-extrabold tracking-tight">{t('auth.forgot_password.title')}</h1>
          <p className="text-muted-foreground text-base">{t('auth.forgot_password.subtitle')}</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground/80">{t('auth.login.email')}</label>
            <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                focusedField === 'email' ? 'text-primary' : 'text-muted-foreground/50'
              }`} />
              <input
                type="email"
                placeholder={t('auth.forgot_password.email_placeholder')}
                {...register('email')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full h-12 pl-11 pr-4 rounded-xl border bg-background text-sm transition-all duration-200 outline-none
                  ${errors.email
                    ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
                    : 'border-input hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
            </div>
            {errors.email && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />{errors.email.message}
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
                  {t('auth.forgot_password.submit')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>

        {/* Footer */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-sm text-muted-foreground">
          {t('auth.forgot_password.remember')}{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            {t('auth.forgot_password.back_to_login')}
          </Link>
        </motion.p>
      </div>
    </AuthLayout>
  );
}
