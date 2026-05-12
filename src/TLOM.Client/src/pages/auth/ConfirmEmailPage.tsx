import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '@/shared/api/apiClient';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, MailX, ShieldCheck } from 'lucide-react';

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { t } = useTranslation();

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
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center relative z-10"
      >
        {/* Loading State */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Loader2 className="h-10 w-10 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-extrabold mb-2">{t('auth.confirm_email.title')}</h2>
              <p className="text-muted-foreground">{t('auth.confirm_email.verifying')}</p>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            >
              <div className="mx-auto w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center shadow-lg shadow-green-500/10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', bounce: 0.6 }}
                >
                  <ShieldCheck className="h-12 w-12 text-green-500" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-2xl font-extrabold mb-2">{t('auth.confirm_email.success')}</h2>
              <p className="text-muted-foreground">{t('auth.confirm_email.success_desc')}</p>
            </motion.div>

            {/* Confetti dots */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
                  left: `${20 + i * 12}%`,
                  top: '20%',
                }}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: [0, -40, -60], x: [0, (i % 2 === 0 ? 10 : -10)] }}
                transition={{ delay: 0.3 + i * 0.1, duration: 1.2 }}
              />
            ))}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Button asChild className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 group">
                <Link to="/login">
                  {t('auth.confirm_email.go_login')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            >
              <div className="mx-auto w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
                <MailX className="h-12 w-12 text-destructive" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-2xl font-extrabold mb-2">{t('auth.confirm_email.error')}</h2>
              <p className="text-muted-foreground">{t('auth.confirm_email.error_desc')}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl text-base font-semibold group">
                <Link to="/register">
                  {t('auth.confirm_email.go_register')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
