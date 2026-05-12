import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/shared/api/apiClient';
import { Button } from '@/shared/ui/Button';
import { Loader2, ArrowLeft, Trash2, Save, Heart, MessageSquare, Send, X, Pencil, Star, Calendar, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';

const updateEntrySchema = z.object({
  status: z.enum(['Planned', 'InProgress', 'Completed', 'Dropped']),
  rating: z.number().min(1).max(10).nullable().optional(),
  review: z.string().max(2000).nullable().optional(),
  isPrivate: z.boolean(),
  startedAt: z.string().nullable().optional(),
  finishedAt: z.string().nullable().optional(),
});

type UpdateEntryForm = z.infer<typeof updateEntrySchema>;

interface EntryDto {
  id: string;
  userId: string;
  mediaItemId: string;
  mediaItemTitle: string;
  mediaItemCoverImageUrl: string | null;
  mediaType: string;
  genres: string[];
  status: 'Planned' | 'InProgress' | 'Completed' | 'Dropped';
  isPrivate: boolean;
  isFavorite: boolean;
  rating: number | null;
  review: string | null;
  timeSpent: number | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
}

interface CommentDto {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  entryId: string;
  text: string;
  createdAt: string;
}

const getStatusLabel = (status: string, mediaType: string, t: any) => {
  const mt = mediaType.toLowerCase();
  if (mt === 'music') {
    return t(`search.status.music_${status === 'Planned' ? 'planned' : status === 'InProgress' ? 'inprogress' : status === 'Completed' ? 'completed' : 'dropped'}`, status);
  }
  if (mt === 'book') {
    return t(`search.status.book_${status === 'Planned' ? 'planned' : status === 'InProgress' ? 'inprogress' : status === 'Completed' ? 'completed' : 'dropped'}`, status);
  }
  if (mt === 'game') {
    return t(`search.status.game_${status === 'Planned' ? 'planned' : status === 'InProgress' ? 'inprogress' : status === 'Completed' ? 'completed' : 'dropped'}`, status);
  }
  return t(`search.status.movie_${status === 'Planned' ? 'planned' : status === 'InProgress' ? 'inprogress' : status === 'Completed' ? 'completed' : 'dropped'}`, status);
};

export function EntryDetailsPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const connection = useNotificationStore((s) => s.connection);
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data: entry, isLoading, isError } = useQuery({
    queryKey: ['entry', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/entries/${id}`);
      return res.data as EntryDto;
    },
    enabled: !!id,
  });

  const isOwner = entry?.userId === currentUser?.userProfileId;

  const { data: likeStatus } = useQuery({
    queryKey: ['likeStatus', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/social/like/${id}/status`);
      return res.data as { isLiked: boolean; likesCount: number };
    },
    enabled: !!id && !!currentUser,
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/social/comments/${id}`);
      return res.data as CommentDto[];
    },
    enabled: !!id,
  });

  const { data: likers } = useQuery({
    queryKey: ['likers', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/social/like/${id}/likers`);
      return res.data as { id: string; username: string; avatarUrl: string | null; createdAt: string }[];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!connection || !id) return;
    const handleLike = (data: any) => { if (data.entryId === id) { queryClient.invalidateQueries({ queryKey: ['likeStatus', id] }); queryClient.invalidateQueries({ queryKey: ['likers', id] }); queryClient.invalidateQueries({ queryKey: ['entry', id] }); } };
    const handleComment = (data: any) => { if (data.entryId === id) { queryClient.invalidateQueries({ queryKey: ['comments', id] }); queryClient.invalidateQueries({ queryKey: ['entry', id] }); } };
    connection.on('EntryLiked', handleLike);
    connection.on('NewComment', handleComment);
    return () => { connection.off('EntryLiked', handleLike); connection.off('NewComment', handleComment); };
  }, [connection, id, queryClient]);

  const { register, handleSubmit, reset, watch, setValue, formState: { isDirty, isSubmitting } } = useForm<UpdateEntryForm>({
    resolver: zodResolver(updateEntrySchema),
    defaultValues: { status: 'Planned', rating: null, review: '', isPrivate: false, startedAt: '', finishedAt: '' }
  });

  const currentStatus = watch('status');

  useEffect(() => {
    if (entry) {
      reset({
        status: entry.status,
        rating: entry.rating,
        review: entry.review || '',
        isPrivate: entry.isPrivate,
        startedAt: entry.startedAt ? new Date(entry.startedAt).toISOString().split('T')[0] : '',
        finishedAt: entry.finishedAt ? new Date(entry.finishedAt).toISOString().split('T')[0] : '',
      });
    }
  }, [entry, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateEntryForm) => {
      const sanitizedRating = (data.rating !== null && data.rating !== undefined && !isNaN(data.rating)) ? data.rating : null;
      await apiClient.put(`/api/entries/${id}`, {
        status: data.status, rating: sanitizedRating, review: data.review || null, isPrivate: data.isPrivate,
        startedAt: data.startedAt ? new Date(data.startedAt).toISOString() : null,
        finishedAt: data.finishedAt ? new Date(data.finishedAt).toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entry', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success(t('entry.save'));
      setIsEditing(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => { await apiClient.delete(`/api/entries/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['timeline'] }); queryClient.invalidateQueries({ queryKey: ['feed'] }); navigate('/timeline'); }
  });

  const likeMutation = useMutation({
    mutationFn: async () => { if (likeStatus?.isLiked) { await apiClient.delete(`/api/social/like/${id}`); } else { await apiClient.post(`/api/social/like/${id}`); } },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['likeStatus', id] }); queryClient.invalidateQueries({ queryKey: ['entry', id] }); },
    onError: (err: any) => { toast.error(err.response?.data?.detail || err.response?.data?.message || 'Error'); }
  });

  const commentMutation = useMutation({
    mutationFn: async (text: string) => { const res = await apiClient.post('/api/social/comment', { entryId: id, text }); return res.data; },
    onSuccess: () => { setCommentText(''); queryClient.invalidateQueries({ queryKey: ['comments', id] }); queryClient.invalidateQueries({ queryKey: ['entry', id] }); },
    onError: (err: any) => { toast.error(err.response?.data?.detail || err.response?.data?.message || 'Error'); }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => { await apiClient.delete(`/api/social/comment/${commentId}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['comments', id] }); queryClient.invalidateQueries({ queryKey: ['entry', id] }); }
  });

  const onSubmit = async (data: UpdateEntryForm) => { try { await updateMutation.mutateAsync(data); } catch (error) { toast.error('Failed to update entry.'); } };
  const handleDelete = async () => { if (window.confirm(t('entry.confirm_delete'))) { try { await deleteMutation.mutateAsync(); } catch {} } };

  if (isLoading) return <div className="flex justify-center items-center h-[calc(100vh-100px)]"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (isError || !entry) return <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4"><p className="text-xl font-medium text-destructive">{t('search.error')}</p><Button onClick={() => navigate(-1)} variant="outline">{t('entry.back')}</Button></div>;

  const statusLabel = getStatusLabel(entry.status, entry.mediaType, t);
  const likesCount = likeStatus?.likesCount ?? entry.likesCount ?? 0;
  const commentsCount = comments?.length ?? entry.commentsCount ?? 0;

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-background relative overflow-hidden">
      {/* Ambient Background */}
      {entry.mediaItemCoverImageUrl && <div className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-[0.08] pointer-events-none" style={{ backgroundImage: `url(${entry.mediaItemCoverImageUrl})` }} />}
      <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -top-40 -right-40 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('entry.back')}
        </Button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Poster */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="shrink-0 w-full md:w-80">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] bg-muted group">
              {entry.mediaItemCoverImageUrl ? (
                <img src={entry.mediaItemCoverImageUrl} alt={entry.mediaItemTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold uppercase">{t('search.no_image')}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-widest">{statusLabel}</span>
                {entry.isPrivate && <span className="px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur text-white/80 text-xs font-bold"><Lock className="w-3 h-3 inline mr-1" />{t('search.modal.is_private')}</span>}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 flex flex-col">
            {/* Type Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase w-fit mb-4">
              {entry.mediaType === 'Movie' ? t('search.tabs.movies') : entry.mediaType === 'Game' ? t('search.tabs.games') : entry.mediaType === 'Book' ? t('search.tabs.books') : t('search.tabs.music')}
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight leading-tight mb-4">{entry.mediaItemTitle}</h1>

            {/* Genres */}
            {entry.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {entry.genres.map(g => <span key={g} className="px-3 py-1 rounded-lg bg-muted/50 text-muted-foreground text-xs font-bold border border-border/50">{g}</span>)}
              </div>
            )}

            {/* Rating */}
            {entry.rating && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 transition-colors ${i < entry.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-border'}`} />
                  ))}
                </div>
                <span className="text-2xl font-black text-yellow-500">{entry.rating}<span className="text-sm text-yellow-500/50">/10</span></span>
              </div>
            )}

            {/* Dates */}
            {(entry.startedAt || entry.finishedAt) && (
              <div className="flex flex-wrap gap-4 mb-6">
                {entry.startedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold">{t('search.modal.started_at')}:</span>
                    {new Date(entry.startedAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                {entry.finishedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold">{t('search.modal.finished_at')}:</span>
                    {new Date(entry.finishedAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
            )}

            {/* Review */}
            {entry.review && (
              <div className="glass-strong rounded-2xl p-6 mb-6 relative">
                <span className="absolute -top-3 left-4 text-5xl text-primary/20 font-serif leading-none">"</span>
                <p className="text-foreground/90 italic font-medium leading-relaxed relative z-10">{entry.review}</p>
              </div>
            )}

            {/* Social Bar */}
            <div className="flex items-center gap-4 py-5 border-t border-b border-border/50 mb-6">
              {currentUser && !isOwner && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => likeMutation.mutate()} disabled={likeMutation.isPending}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${likeStatus?.isLiked ? 'bg-red-500/10 text-red-500 shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-red-500/10 hover:text-red-500'}`}>
                  <Heart className={`h-5 w-5 ${likeStatus?.isLiked ? 'fill-current' : ''}`} /> {likesCount}
                </motion.button>
              )}
              {isOwner && (
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><Heart className="h-5 w-5" /> {likesCount} {t('entry.likes', 'likes')}</div>
              )}
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><MessageSquare className="h-5 w-5" /> {commentsCount} {t('entry.comments_label', 'comments')}</div>
              
              {isOwner && (
                <div className="ml-auto flex items-center gap-3">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsEditing(!isEditing)}>
                    <Pencil className="w-4 h-4 mr-2" /> {isEditing ? t('entry.cancel_edit', 'Cancel') : t('entry.edit', 'Edit')}
                  </Button>
                  <Button variant="destructive" size="sm" className="rounded-full" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    <Trash2 className="w-4 h-4 mr-2" /> {t('entry.delete')}
                  </Button>
                </div>
              )}
            </div>

            {/* Likers Section */}
            {likers && likers.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {likers.slice(0, 8).map((liker) => (
                      <Link key={liker.id} to={`/users/${liker.username}`} title={`@${liker.username}`}>
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden hover:scale-110 hover:z-10 transition-transform relative">
                          {liker.avatarUrl ? <img src={liker.avatarUrl} className="w-full h-full object-cover" /> : liker.username.charAt(0)}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">{likers.slice(0, 3).map(l => `@${l.username}`).join(', ')}</span>
                    {likers.length > 3 && ` ${t('entry.and_others', 'and')} ${likers.length - 3} ${t('entry.others', 'others')}`}
                    {' '}{t('entry.liked_this', 'liked this')}
                  </span>
                </div>
              </div>
            )}
            {/* Edit Form (Collapsible) */}
            <AnimatePresence>
              {isEditing && isOwner && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
                  <div className="glass-strong rounded-2xl p-6 border border-primary/20">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('search.modal.status')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['Planned', 'InProgress', 'Completed', 'Dropped'].map((s) => (
                            <div key={s} onClick={() => setValue('status', s as any, { shouldDirty: true })}
                              className={`cursor-pointer rounded-xl border p-3 text-center transition-all font-bold text-sm ${currentStatus === s ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-background/50 border-border/50 text-muted-foreground hover:bg-muted/80'}`}>
                              {getStatusLabel(s, entry.mediaType, t)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Star className="w-4 h-4" /> {t('search.modal.rating')}</label>
                          <input type="number" min="1" max="10" {...register('rating', { valueAsNumber: true })} className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 px-4 py-2 text-lg font-bold shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="-" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> {t('search.modal.started_at')}</label>
                          <input type="date" {...register('startedAt')} className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 px-4 py-2 text-sm font-medium shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [color-scheme:dark]" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> {t('search.modal.finished_at')}</label>
                          <input type="date" {...register('finishedAt')} className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 px-4 py-2 text-sm font-medium shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [color-scheme:dark]" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('search.modal.review')}</label>
                        <textarea {...register('review')} className="flex min-h-[120px] w-full rounded-xl border border-white/10 bg-background/50 px-4 py-3 text-sm font-medium shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none" placeholder={t('search.modal.review_placeholder')} />
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center space-x-3 bg-background/50 px-4 py-2 rounded-xl border border-white/5">
                          <input type="checkbox" id="isPrivate" {...register('isPrivate')} className="h-5 w-5 rounded-md border-white/20 text-primary focus:ring-primary bg-background" />
                          <label htmlFor="isPrivate" className="text-sm font-bold text-muted-foreground cursor-pointer">{t('search.modal.is_private')}</label>
                        </div>
                        <Button type="submit" size="lg" className="rounded-xl px-8 shadow-lg" disabled={!isDirty || isSubmitting}>
                          {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                          {t('entry.save')}
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Comments Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12 glass-strong rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-display font-bold flex items-center gap-3 mb-8">
            <MessageSquare className="h-6 w-6 text-primary" /> {t('entry.comments_title', 'Comments')} ({commentsCount})
          </h3>

          {/* Add Comment */}
          {currentUser && (
            <div className="flex gap-3 mb-8">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold uppercase shrink-0 overflow-hidden">
                {currentUser.username?.charAt(0) || '?'}
              </div>
              <div className="flex-1 flex gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={t('entry.write_comment', 'Write a comment...')}
                  className="flex-1 h-10 px-4 rounded-full border border-white/10 bg-background/50 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onKeyDown={(e) => { if (e.key === 'Enter' && commentText.trim().length >= 2) { commentMutation.mutate(commentText.trim()); } }} />
                <Button size="sm" className="rounded-full h-10 w-10 p-0 shadow-lg" disabled={commentText.trim().length < 2 || commentMutation.isPending} onClick={() => commentMutation.mutate(commentText.trim())}>
                  {commentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-5">
            <AnimatePresence>
              {comments?.map((comment) => (
                <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className="flex gap-3 group">
                  <Link to={`/users/${comment.username}`} className="shrink-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase overflow-hidden hover:ring-2 ring-primary transition-all">
                      {comment.avatarUrl ? <img src={comment.avatarUrl} className="h-full w-full object-cover" /> : comment.username.charAt(0)}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0 bg-background/30 rounded-2xl p-4 border border-border/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/users/${comment.username}`} className="text-sm font-bold hover:text-primary transition-colors">@{comment.username}</Link>
                      <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}</span>
                      {(comment.userId === currentUser?.userProfileId || isOwner) && (
                        <button onClick={() => deleteCommentMutation.mutate(comment.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80">{comment.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {(!comments || comments.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8 italic">{t('entry.no_comments', 'No comments yet. Be the first!')}</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
