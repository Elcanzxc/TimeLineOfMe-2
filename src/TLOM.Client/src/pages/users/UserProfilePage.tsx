import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Button } from '@/shared/ui/Button';
import { Loader2, UserPlus, UserMinus, ShieldCheck, X, Users, Star, Settings, Compass } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { useEffect, useState } from 'react';

interface UserProfileDto {
  id: string; username: string; firstName: string | null; lastName: string | null;
  dateOfBirth: string | null; city: string | null; country: string | null;
  bio: string | null; avatarUrl: string | null; followersCount: number; followingCount: number;
}
interface FollowUser { userProfileId: string; username: string; avatarUrl: string | null; bio: string | null; followedAt: string; }
type ModalType = 'followers' | 'following' | null;

const getStatusLabel = (status: string, mediaType: string, t: any) => {
  const mt = mediaType?.toLowerCase();
  const key = status === 'Planned' ? 'planned' : status === 'InProgress' ? 'inprogress' : status === 'Completed' ? 'completed' : 'dropped';
  if (mt === 'music') return t(`search.status.music_${key}`, status);
  if (mt === 'book') return t(`search.status.book_${key}`, status);
  if (mt === 'game') return t(`search.status.game_${key}`, status);
  return t(`search.status.movie_${key}`, status);
};

export function UserProfilePage() {
  const { t, i18n } = useTranslation();
  const { username } = useParams<{ username: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const isMe = currentUser?.username === username;
  const connection = useNotificationStore((s) => s.connection);
  const [modalType, setModalType] = useState<ModalType>(null);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => { const res = await apiClient.get(`/api/users/${username}`); return res.data as UserProfileDto; },
    enabled: !!username,
  });

  const { data: followStatus } = useQuery({
    queryKey: ['followStatus', profile?.id],
    queryFn: async () => { const res = await apiClient.get(`/api/social/follow/${profile?.id}/status`); return res.data as { isFollowing: boolean }; },
    enabled: !!profile?.id && !!currentUser?.userProfileId && !isMe,
  });

  const isFollowing = followStatus?.isFollowing || false;

  const { data: followers } = useQuery({
    queryKey: ['followers', profile?.id],
    queryFn: async () => { const res = await apiClient.get(`/api/social/followers/${profile?.id}`); return res.data as FollowUser[]; },
    enabled: !!profile?.id && modalType === 'followers',
  });

  const { data: following } = useQuery({
    queryKey: ['following', profile?.id],
    queryFn: async () => { const res = await apiClient.get(`/api/social/following/${profile?.id}`); return res.data as FollowUser[]; },
    enabled: !!profile?.id && modalType === 'following',
  });

  const followMutation = useMutation({
    mutationFn: async () => { if (isFollowing) { await apiClient.delete(`/api/social/follow/${profile?.id}`); } else { await apiClient.post(`/api/social/follow/${profile?.id}`); } },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followStatus', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      queryClient.invalidateQueries({ queryKey: ['followers', profile?.id] });
      toast.success(isFollowing ? t('users.profile.unfollow') : t('users.profile.follow'));
    },
    onError: (err: any) => { toast.error(err.response?.data?.detail || err.response?.data?.message || 'Error'); }
  });

  useEffect(() => {
    if (!connection) return;
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
      queryClient.invalidateQueries({ queryKey: ['followStatus', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['followers', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['following', profile?.id] });
    };
    connection.on('FollowChanged', handler);
    return () => { connection.off('FollowChanged', handler); };
  }, [connection, queryClient, username, profile?.id]);

  const { data: entriesData, isLoading: isEntriesLoading } = useQuery({
    queryKey: ['timeline', profile?.id],
    queryFn: async () => { const res = await apiClient.get(`/api/entries/user/${profile?.id}`); return res.data; },
    enabled: !!profile?.id,
  });

  const entries = entriesData?.items || entriesData || [];

  if (isProfileLoading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!profile) return <div className="p-20 text-center text-xl font-bold text-muted-foreground">{t('users.not_found', 'User not found')}</div>;

  const modalList = modalType === 'followers' ? followers : following;
  const modalTitle = modalType === 'followers' ? t('users.profile.followers_list') : t('users.profile.following_list');
  const emptyText = modalType === 'followers' ? t('users.profile.no_followers') : t('users.profile.no_following');
  const displayName = (profile.firstName || profile.lastName) ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : profile.username;

  // Stats from entries
  const totalEntries = entries.length;
  const completedEntries = entries.filter((e: any) => e.status === 'Completed').length;
  const avgRating = entries.filter((e: any) => e.rating).length > 0
    ? (entries.filter((e: any) => e.rating).reduce((s: number, e: any) => s + e.rating, 0) / entries.filter((e: any) => e.rating).length).toFixed(1)
    : '-';

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] top-1/3 -right-60 pointer-events-none" />

      {/* Followers/Following Modal */}
      <AnimatePresence>
        {modalType && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setModalType(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <h3 className="text-lg font-bold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> {modalTitle}</h3>
                <button onClick={() => setModalType(null)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-3">
                {!modalList ? <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                : modalList.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">{emptyText}</div>
                : <div className="space-y-1">{modalList.map((user) => (
                  <Link key={user.userProfileId} to={`/users/${user.username}`} onClick={() => setModalType(null)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold uppercase overflow-hidden shrink-0">
                      {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" /> : user.username.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">@{user.username}</p>{user.bio && <p className="text-xs text-muted-foreground truncate">{user.bio}</p>}</div>
                  </Link>
                ))}</div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-10">
        {/* Profile Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
          className="glass-strong rounded-[2rem] overflow-hidden relative group">
          {/* Banner with animated gradient */}
          <div className="h-40 md:h-52 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10 animate-gradient-x" />
            {profile.avatarUrl && <div className="absolute inset-0 bg-cover bg-center blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity duration-700" style={{ backgroundImage: `url(${profile.avatarUrl})` }} />}
            {/* Floating particles */}
            <div className="absolute top-6 left-[20%] w-3 h-3 bg-primary/30 rounded-full animate-float" />
            <div className="absolute top-12 left-[60%] w-2 h-2 bg-accent/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-8 left-[80%] w-4 h-4 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="px-6 md:px-10 pb-8 relative">
            {/* Avatar with glow ring */}
            <div className="relative -mt-16 md:-mt-20 mb-6 flex flex-col md:flex-row md:items-end gap-6">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
                className="relative mx-auto md:mx-0 shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-muted flex items-center justify-center text-5xl font-bold text-muted-foreground uppercase overflow-hidden shadow-2xl">
                  {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.username} className="h-full w-full object-cover" /> : profile.username.charAt(0)}
                </div>
              </motion.div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-display font-extrabold flex items-center justify-center md:justify-start gap-3">
                  {displayName}
                  {profile.followersCount > 100 && <ShieldCheck className="h-6 w-6 text-primary" />}
                </h1>
                <p className="text-muted-foreground font-medium mt-1">@{profile.username}</p>
              </div>

              <div className="flex shrink-0 justify-center md:justify-end">
                {isMe ? (
                  <Button variant="outline" className="rounded-full px-6 h-11 font-bold" onClick={() => window.location.href = '/settings'}>
                    <Settings className="w-4 h-4 mr-2" /> {t('users.profile.edit_profile', 'Edit Profile')}
                  </Button>
                ) : (
                  <Button size="lg" variant={isFollowing ? "outline" : "default"} onClick={() => followMutation.mutate()} disabled={followMutation.isPending}
                    className={`rounded-full px-8 h-11 font-bold ${!isFollowing && 'shadow-[0_10px_30px_-10px_rgba(var(--primary),0.5)]'}`}>
                    {followMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> :
                      isFollowing ? <><UserMinus className="h-4 w-4 mr-2" /> {t('users.profile.unfollow')}</> :
                      <><UserPlus className="h-4 w-4 mr-2" /> {t('users.profile.follow')}</>}
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && <p className="text-foreground/90 font-medium max-w-2xl text-center md:text-left mb-6">{profile.bio}</p>}

            {/* Location & Birthday */}
            {(profile.city || profile.country || profile.dateOfBirth) && (
              <div className="flex flex-wrap gap-4 mb-6 justify-center md:justify-start text-sm text-muted-foreground">
                {(profile.city || profile.country) && <span className="flex items-center gap-1.5">📍 {[profile.city, profile.country].filter(Boolean).join(', ')}</span>}
                {profile.dateOfBirth && <span className="flex items-center gap-1.5">🎂 {new Date(profile.dateOfBirth).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button onClick={() => setModalType('followers')} className="glass rounded-2xl px-5 py-3 text-center hover:bg-primary/10 transition-all cursor-pointer group">
                <span className="font-black text-xl group-hover:text-primary transition-colors">{profile.followersCount}</span>
                <span className="text-[11px] text-muted-foreground block uppercase font-bold tracking-wider">{t('users.profile.followers')}</span>
              </button>
              <button onClick={() => setModalType('following')} className="glass rounded-2xl px-5 py-3 text-center hover:bg-primary/10 transition-all cursor-pointer group">
                <span className="font-black text-xl group-hover:text-primary transition-colors">{profile.followingCount}</span>
                <span className="text-[11px] text-muted-foreground block uppercase font-bold tracking-wider">{t('users.profile.following')}</span>
              </button>
              <div className="glass rounded-2xl px-5 py-3 text-center">
                <span className="font-black text-xl">{totalEntries}</span>
                <span className="text-[11px] text-muted-foreground block uppercase font-bold tracking-wider">{t('timeline.entries', 'Entries')}</span>
              </div>
              <div className="glass rounded-2xl px-5 py-3 text-center">
                <span className="font-black text-xl">{completedEntries}</span>
                <span className="text-[11px] text-muted-foreground block uppercase font-bold tracking-wider">{t('stats.completed', 'Completed')}</span>
              </div>
              <div className="glass rounded-2xl px-5 py-3 text-center">
                <span className="font-black text-xl text-yellow-500">{avgRating}</span>
                <span className="text-[11px] text-muted-foreground block uppercase font-bold tracking-wider">{t('timeline.avg_rating', 'Avg Rating')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-display font-bold mb-6">{displayName}{t('users.profile.possessive_timeline', "'s Timeline")}</h2>
          
          {isEntriesLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : !entries || entries.length === 0 ? (
            <div className="glass-strong rounded-3xl p-16 text-center">
              <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold text-muted-foreground">{t('users.profile.no_timeline')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {entries.map((entry: any, i: number) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={`/entry/${entry.id}`}>
                    <div className="rounded-2xl overflow-hidden border border-border/50 bg-card/40 backdrop-blur-sm relative aspect-[2/3] group cursor-pointer hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.3)] hover:-translate-y-2 transition-all duration-500">
                      {entry.mediaItemCoverImageUrl ? (
                        <img src={entry.mediaItemCoverImageUrl} alt={entry.mediaItemTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs text-center p-2 font-bold uppercase">{entry.mediaItemTitle}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1.5 drop-shadow">{entry.mediaItemTitle}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-white uppercase px-2 py-0.5 rounded-md bg-primary/80">{getStatusLabel(entry.status, entry.mediaType, t)}</span>
                          {entry.rating && <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-0.5"><Star className="w-3 h-3 fill-current" />{entry.rating}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
