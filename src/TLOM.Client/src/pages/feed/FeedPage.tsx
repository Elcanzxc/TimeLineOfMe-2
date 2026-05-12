import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Loader2, MessageSquare, Heart, Sparkles, Layers, Star, Info, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { useEffect } from 'react';
import { toast } from 'sonner';

/* ─── Like Button Component ─── */
function FeedLikeButton({ entryId }: { entryId: string }) {
  const { data: likeStatus } = useQuery({
    queryKey: ['likeStatus', entryId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/social/like/${entryId}/status`);
      return res.data as { isLiked: boolean; likesCount: number };
    },
  });

  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (likeStatus?.isLiked) {
        await apiClient.delete(`/api/social/like/${entryId}`);
      } else {
        await apiClient.post(`/api/social/like/${entryId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likeStatus', entryId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Error');
    }
  });

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); likeMutation.mutate(); }}
      disabled={likeMutation.isPending}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${
        likeStatus?.isLiked 
          ? 'bg-red-500/10 text-red-500 shadow-sm' 
          : 'bg-muted/50 text-muted-foreground hover:bg-red-500/10 hover:text-red-500'
      }`}
    >
      <Heart className={`h-4 w-4 transition-transform duration-300 ${likeStatus?.isLiked ? 'fill-current scale-110' : 'scale-100'}`} />
      {likeStatus?.likesCount ?? 0}
    </motion.button>
  );
}

/* ─── Floating Blob Component ─── */
function FloatingBlob({ className, delay = 0 }: { className: string, delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[100px] opacity-30 pointer-events-none ${className}`}
      animate={{
        x: [0, 40, -30, 0],
        y: [0, -50, 30, 0],
        scale: [1, 1.2, 0.8, 1],
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

export function FeedPage() {
  const { t, i18n } = useTranslation();
  const currentUser = useAuthStore((s) => s.user);
  const connection = useNotificationStore((s) => s.connection);
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = null }) => {
      const res = await apiClient.get('/api/feed', {
        params: { cursor: pageParam, pageSize: 10 }
      });
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
  });

  const { data: statsData } = useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const res = await apiClient.get('/api/stats/platform');
      return res.data;
    }
  });

  // SignalR real-time feed updates
  useEffect(() => {
    if (!connection) return;

    const handleLike = () => {
      queryClient.invalidateQueries({ queryKey: ['likeStatus'] });
    };

    const handleComment = () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    };

    const handleFollow = () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    };

    connection.on('EntryLiked', handleLike);
    connection.on('NewComment', handleComment);
    connection.on('FollowChanged', handleFollow);

    return () => {
      connection.off('EntryLiked', handleLike);
      connection.off('NewComment', handleComment);
      connection.off('FollowChanged', handleFollow);
    };
  }, [connection, queryClient]);

  const items = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-background relative overflow-hidden">
      {/* ─── Global Background Blobs & Grid ─── */}
      <FloatingBlob className="w-[600px] h-[600px] bg-primary/20 -top-40 -left-40" delay={0} />
      <FloatingBlob className="w-[700px] h-[700px] bg-accent/20 top-1/3 -right-60" delay={4} />
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* ─── Hero Section ─── */}
      <div className="relative pt-12 pb-20 px-4 md:px-8 z-10 border-b border-border/30 bg-gradient-to-b from-card/30 to-transparent">
        <div className="max-w-6xl mx-auto flex flex-col xl:flex-row gap-12 items-center xl:items-start justify-between">
          
          {/* Welcome Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 space-y-5 text-center xl:text-left mt-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {t('feed.hero_badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-display leading-[1.1]">
              {t('feed.hero_title_1')} <br/>
              <span className="text-gradient">{t('feed.hero_title_2')}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto xl:mx-0 leading-relaxed font-medium">
              {t('feed.subtitle')}
            </p>
          </motion.div>

          {/* Stats & News Glass Cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl xl:max-w-none relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 blur-[80px] -z-10" />
            
            {/* Stats Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-foreground/80 relative z-10">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t('feed.stats.title')}
              </h3>
              <div className="space-y-5 relative z-10">
                {[
                  { label: t('feed.stats.users'), value: statsData?.activeUsers || 0 },
                  { label: t('feed.stats.entries'), value: statsData?.mediaEntries || 0 },
                  { label: t('feed.stats.reviews'), value: statsData?.reviewsWritten || 0 }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
                    <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                    <span className="font-display font-bold text-xl">{stat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* News Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-foreground/80">
                <Info className="w-4 h-4 text-accent" />
                {t('feed.news.title')}
              </h3>
              <div className="space-y-5">
                <div className="group cursor-default">
                  <h4 className="font-bold text-sm mb-1 text-foreground transition-colors group-hover:text-primary">{t('feed.news.item1_title')}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('feed.news.item1_desc')}</p>
                </div>
                <div className="group cursor-default">
                  <h4 className="font-bold text-sm mb-1 text-foreground transition-colors group-hover:text-primary">{t('feed.news.item2_title')}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('feed.news.item2_desc')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Feed Content ─── */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-32 relative z-10 -mt-8">
        {status === 'pending' && (
          <div className="flex justify-center p-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {status === 'error' && (
          <div className="p-10 text-center text-destructive bg-destructive/10 rounded-2xl border border-destructive/20 font-medium">
            Failed to load feed.
          </div>
        )}

        {status === 'success' && items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 glass rounded-[2.5rem] mt-10"
          >
            <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6 border border-border/50">
              <Layers className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">{t('feed.empty_title')}</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg">{t('feed.empty_desc')}</p>
            <Button asChild className="rounded-xl px-8 h-12 text-base font-bold shadow-lg shadow-primary/20 group">
              <Link to="/users">
                {t('feed.find_users')}
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-8 mt-10">
            <AnimatePresence>
              {items.map((entry: any, i: number) => (
                <motion.div 
                  key={`${entry.id}-${i}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5, type: 'spring' }}
                  className="group relative bg-card/60 backdrop-blur-xl border border-border/60 rounded-[2rem] p-5 md:p-7 shadow-lg hover:shadow-2xl hover:bg-card/80 transition-all duration-500 overflow-hidden"
                >
                  {/* Subtle background glow from cover image if available */}
                  {entry.mediaItemCoverImageUrl && (
                    <div 
                      className="absolute inset-0 opacity-[0.03] blur-3xl pointer-events-none transition-opacity group-hover:opacity-[0.06] duration-500"
                      style={{ backgroundImage: `url(${entry.mediaItemCoverImageUrl})`, backgroundSize: 'cover' }}
                    />
                  )}

                  {/* User Header */}
                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <Link to={`/users/${entry.userUsername || entry.userId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {entry.userAvatarUrl ? (
                           <img src={entry.userAvatarUrl} className="w-full h-full object-cover" alt={entry.userUsername} />
                        ) : (
                           <span className="text-xs font-bold text-primary uppercase">{entry.userUsername?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm leading-none tracking-tight">@{entry.userUsername || 'user'}</div>
                        <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{t('feed.updated_timeline')}</div>
                      </div>
                    </Link>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                    {/* Poster */}
                    <Link to={`/entry/${entry.id}`} className="shrink-0 w-32 h-48 sm:w-40 sm:h-56 rounded-2xl overflow-hidden bg-muted border border-border/50 relative shadow-md group/poster">
                      {entry.mediaItemCoverImageUrl ? (
                        <img src={entry.mediaItemCoverImageUrl} alt={entry.mediaItemTitle} className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground uppercase tracking-widest text-center bg-muted/50">
                          {t('feed.no_image')}
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm border border-white/10">
                        {entry.mediaType === 'Movie' ? t('search.tabs.movies') : 
                         entry.mediaType === 'Game' ? t('search.tabs.games') : 
                         entry.mediaType === 'Book' ? t('search.tabs.books') : 
                         entry.mediaType === 'Music' ? t('search.tabs.music') : entry.mediaType}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <Link to={`/entry/${entry.id}`}>
                          <h3 className="text-2xl sm:text-3xl font-display font-extrabold leading-[1.15] mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {entry.mediaItemTitle}
                          </h3>
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary uppercase tracking-widest border border-primary/20">
                            {entry.status === 'Planned' ? t('search.modal.status_planned') :
                             entry.status === 'InProgress' ? t('search.modal.status_inprogress') :
                             entry.status === 'Completed' ? t('search.modal.status_completed') :
                             entry.status === 'Dropped' ? t('search.modal.status_dropped') : entry.status}
                          </span>
                          {entry.rating && (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                              <Star className="w-3.5 h-3.5 fill-current" /> {entry.rating}/10
                            </span>
                          )}
                          {(entry.startedAt || entry.createdAt) && (
                            <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground uppercase tracking-widest">
                              {new Date(entry.startedAt || entry.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>

                        {entry.review && (
                          <div className="text-sm text-foreground/90 italic bg-card/50 p-4 sm:p-5 rounded-2xl border border-border/50 relative shadow-sm">
                            <span className="absolute -top-4 -left-1 text-4xl text-primary/30 font-serif leading-none">"</span>
                            <p className="relative z-10 line-clamp-3 font-medium leading-relaxed">{entry.review}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex items-center gap-4 pt-4 border-t border-border/60">
                        {currentUser && (
                          <FeedLikeButton entryId={entry.id} />
                        )}
                        <Link to={`/entry/${entry.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold bg-muted/50 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-300">
                          <MessageSquare className="h-4 w-4" /> 
                          {entry.commentsCount || 0}
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center pt-16">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => fetchNextPage()} 
              disabled={isFetchingNextPage}
              className="rounded-full px-10 h-12 border-border/60 shadow-lg hover:shadow-xl hover:bg-muted/50 transition-all font-bold"
            >
              {isFetchingNextPage ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {t('feed.load_more')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
