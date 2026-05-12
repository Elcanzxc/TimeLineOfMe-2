import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Users, LayoutGrid, MessageSquare, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString()}</span>;
}

/* ─── Floating Blob ─── */
function FloatingBlob({ className, delay = 0 }: { className: string, delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[80px] opacity-40 pointer-events-none ${className}`}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear",
        delay
      }}
    />
  );
}

interface AuthLayoutProps {
  children: React.ReactNode;
  mode: 'login' | 'register';
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  const { t } = useTranslation();

  const { data: stats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const res = await apiClient.get('/api/stats/platform');
      return res.data as { activeUsers: number; mediaEntries: number; reviewsWritten: number };
    },
    staleTime: 60000,
  });

  return (
    <div className="min-h-[calc(100vh-65px)] w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* ─── Global Background Blobs ─── */}
      <FloatingBlob className="w-[500px] h-[500px] bg-primary/20 -top-40 -left-40" delay={0} />
      <FloatingBlob className="w-[600px] h-[600px] bg-accent/20 -bottom-60 -right-20" delay={5} />
      <FloatingBlob className="w-[400px] h-[400px] bg-secondary/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={2} />

      {/* ─── Grid Pattern ─── */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none mix-blend-overlay" />

      {/* ─── Centered Glass Container ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[1100px] min-h-[650px] bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        
        {/* ═══════ LEFT PANEL ═══════ */}
        <div className="lg:w-[45%] relative p-10 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-border/50 bg-gradient-to-br from-primary/10 via-background/50 to-transparent">
          {/* Decorative mesh inside left panel */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(var(--primary),0.15)_0%,transparent_50%)]" />

          {/* Top branding */}
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold tracking-widest uppercase mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Media Tracker
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl lg:text-5xl font-extrabold font-display leading-[1.1] text-foreground mb-4"
            >
              Time Line <br/>
              <span className="text-gradient">Of Me</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-muted-foreground font-medium text-lg max-w-[280px]"
            >
              {t('auth.features.tagline')}
            </motion.p>
          </div>

          {/* Bottom Live Stats (Glass Cards) */}
          <div className="relative z-10 mt-12 lg:mt-0 space-y-3">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 pl-2"
            >
              Join the community
            </motion.p>

            <div className="flex flex-col gap-3">
              {[
                { icon: <Users className="h-5 w-5" />, value: stats?.activeUsers || 0, label: t('feed.stats.users'), color: 'text-blue-500' },
                { icon: <LayoutGrid className="h-5 w-5" />, value: stats?.mediaEntries || 0, label: t('feed.stats.entries'), color: 'text-emerald-500' },
                { icon: <MessageSquare className="h-5 w-5" />, value: stats?.reviewsWritten || 0, label: t('feed.stats.reviews'), color: 'text-purple-500' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1, duration: 0.5, type: 'spring' }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 backdrop-blur-md shadow-sm group hover:shadow-md hover:bg-background/80 transition-all cursor-default"
                >
                  <div className={`w-12 h-12 rounded-xl bg-background shadow-sm border border-border/50 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-display leading-none text-foreground">
                      <AnimatedCounter target={stat.value} />
                    </div>
                    <div className="text-xs font-medium text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ RIGHT PANEL (Form) ═══════ */}
        <div className="lg:w-[55%] relative flex items-center justify-center p-8 lg:p-14 bg-card/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[420px] relative z-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
