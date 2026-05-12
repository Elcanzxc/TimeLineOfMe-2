import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { apiClient } from '@/shared/api/apiClient';
import { cn } from '@/shared/lib/utils';
import { Search, Loader2, Plus, Check, X, Save, Star, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';

const createEntrySchema = z.object({
  status: z.enum(['Planned', 'InProgress', 'Completed', 'Dropped']),
  rating: z.number().min(1).max(10).nullable().optional(),
  review: z.string().max(2000).nullable().optional(),
  isPrivate: z.boolean(),
  startedAt: z.string().nullable().optional(),
  finishedAt: z.string().nullable().optional(),
});

type CreateEntryForm = z.infer<typeof createEntrySchema>;

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type MediaType = 'Movie' | 'Book' | 'Game' | 'Music';

interface MediaSearchResult {
  localId: string | null;
  title: string;
  originalTitle?: string;
  releaseYear: number;
  coverImageUrl?: string;
  description?: string;
  externalId: string;
  source: string;
  mediaType: MediaType;
  alreadyInLibrary: boolean;
}

const getStatusLabel = (status: string, mediaType: MediaType, t: any) => {
  if (mediaType === 'Music') {
    switch (status) {
      case 'Planned': return t('search.status.music_planned', 'Want to Listen');
      case 'InProgress': return t('search.status.music_inprogress', 'On Repeat');
      case 'Completed': return t('search.status.music_completed', 'Listened');
      case 'Dropped': return t('search.status.music_dropped', 'Skipped');
    }
  }
  if (mediaType === 'Book') {
    switch (status) {
      case 'Planned': return t('search.status.book_planned', 'Want to Read');
      case 'InProgress': return t('search.status.book_inprogress', 'Reading');
      case 'Completed': return t('search.status.book_completed', 'Read');
      case 'Dropped': return t('search.status.book_dropped', 'Dropped');
    }
  }
  if (mediaType === 'Game') {
    switch (status) {
      case 'Planned': return t('search.status.game_planned', 'Want to Play');
      case 'InProgress': return t('search.status.game_inprogress', 'Playing');
      case 'Completed': return t('search.status.game_completed', 'Completed');
      case 'Dropped': return t('search.status.game_dropped', 'Dropped');
    }
  }
  // Movie / Default
  switch (status) {
    case 'Planned': return t('search.status.movie_planned', 'Want to Watch');
    case 'InProgress': return t('search.status.movie_inprogress', 'Watching');
    case 'Completed': return t('search.status.movie_completed', 'Watched');
    case 'Dropped': return t('search.status.movie_dropped', 'Dropped');
  }
  return status;
}

// Optional Trending Component for Empty State
function TrendingShowcase({ onSelect }: { onSelect: (m: MediaType) => void }) {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-16 text-center"
    >
      <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
        {t('search.explore_trending', 'Explore Community Trends')}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto opacity-70 hover:opacity-100 transition-opacity">
        <div onClick={() => onSelect('Movie')} className="cursor-pointer glass-strong rounded-2xl p-6 aspect-square flex flex-col items-center justify-center gap-4 hover:bg-primary/10 hover:text-primary transition-all group">
          <span className="text-4xl group-hover:scale-125 transition-transform">🍿</span>
          <span className="font-bold text-sm tracking-wider uppercase">{t('search.tabs.movies')}</span>
        </div>
        <div onClick={() => onSelect('Game')} className="cursor-pointer glass-strong rounded-2xl p-6 aspect-square flex flex-col items-center justify-center gap-4 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all group">
          <span className="text-4xl group-hover:scale-125 transition-transform">🎮</span>
          <span className="font-bold text-sm tracking-wider uppercase">{t('search.tabs.games')}</span>
        </div>
        <div onClick={() => onSelect('Book')} className="cursor-pointer glass-strong rounded-2xl p-6 aspect-square flex flex-col items-center justify-center gap-4 hover:bg-amber-500/10 hover:text-amber-500 transition-all group">
          <span className="text-4xl group-hover:scale-125 transition-transform">📚</span>
          <span className="font-bold text-sm tracking-wider uppercase">{t('search.tabs.books')}</span>
        </div>
        <div onClick={() => onSelect('Music')} className="cursor-pointer glass-strong rounded-2xl p-6 aspect-square flex flex-col items-center justify-center gap-4 hover:bg-purple-500/10 hover:text-purple-500 transition-all group">
          <span className="text-4xl group-hover:scale-125 transition-transform">🎵</span>
          <span className="font-bold text-sm tracking-wider uppercase">{t('search.tabs.music')}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function SearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('Movie');
  const [selectedItem, setSelectedItem] = useState<MediaSearchResult | null>(null);
  const debouncedQuery = useDebounce(query, 500);

  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm<CreateEntryForm>({
    resolver: zodResolver(createEntrySchema),
    defaultValues: {
      status: 'Planned',
      rating: null,
      review: '',
      isPrivate: false,
      startedAt: '',
      finishedAt: ''
    }
  });

  const currentStatus = watch('status');

  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['mediaSearch', debouncedQuery, mediaType],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const res = await apiClient.get('/api/mediaitems/search', {
        params: { query: debouncedQuery, mediaType }
      });
      return res.data as MediaSearchResult[];
    },
    enabled: debouncedQuery.length > 2,
  });

  const importMutation = useMutation({
    mutationFn: async (item: MediaSearchResult) => {
      if (item.alreadyInLibrary && item.localId) return item.localId;
      
      const res = await apiClient.post('/api/mediaitems/import', {
        externalId: item.externalId,
        source: item.source,
        mediaType: item.mediaType
      });
      return res.data.mediaItemId as string;
    }
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: { mediaItemId: string; form: CreateEntryForm }) => {
      const sanitizedRating = (data.form.rating !== null && data.form.rating !== undefined && !isNaN(data.form.rating)) 
        ? data.form.rating 
        : null;
      const res = await apiClient.post('/api/entries', {
        mediaItemId: data.mediaItemId,
        status: data.form.status,
        isPrivate: data.form.isPrivate,
        rating: sanitizedRating,
        review: data.form.review || null,
        startedAt: data.form.startedAt ? new Date(data.form.startedAt).toISOString() : null,
        finishedAt: data.form.finishedAt ? new Date(data.form.finishedAt).toISOString() : null,
      });
      return res.data;
    },
  });

  const handleOpenModal = (item: MediaSearchResult) => {
    setSelectedItem(item);
    reset({
      status: 'Planned',
      rating: null,
      review: '',
      isPrivate: false,
      startedAt: new Date().toISOString().split('T')[0], // Default to today for quick addition
      finishedAt: ''
    });
  };

  const onSubmit = async (form: CreateEntryForm) => {
    if (!selectedItem) return;
    try {
      const mediaItemId = await importMutation.mutateAsync(selectedItem);
      await createEntryMutation.mutateAsync({ mediaItemId, form });
      toast.success(`"${selectedItem.title}" added to your timeline!`);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to add entry', err);
      toast.error('Failed to add entry. Please try again.');
    }
  };

  const tabs: { label: string; value: MediaType }[] = [
    { label: t('search.tabs.movies'), value: 'Movie' },
    { label: t('search.tabs.games'), value: 'Game' },
    { label: t('search.tabs.books'), value: 'Book' },
    { label: t('search.tabs.music'), value: 'Music' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-background relative overflow-hidden py-12">
      {/* Background Blobs */}
      <div className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] top-1/2 -right-40 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-12 relative z-10">
        
        {/* Search Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight">
            {t('search.hero_title', 'What are you experiencing next?')}
          </h1>
          
          {/* Tabs */}
          <div className="flex p-1.5 bg-card/60 backdrop-blur-lg rounded-full w-fit gap-1 border border-border/50 shadow-sm mt-4">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setMediaType(tab.value)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                  mediaType === tab.value 
                    ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-2xl group mt-4">
            <div className="absolute inset-0 bg-primary/20 blur-xl group-focus-within:bg-primary/40 transition-colors rounded-full" />
            <div className="relative flex items-center">
              <Search className="absolute left-6 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder', 'Type to search...')}
                className="pl-16 h-16 text-xl rounded-full bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl focus-visible:ring-primary/50 placeholder:text-muted-foreground/50 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="min-h-[400px]">
          {/* Initial State (No query) */}
          {!debouncedQuery && (
            <TrendingShowcase onSelect={(m) => setMediaType(m)} />
          )}

          {/* Loading */}
          {isLoading && debouncedQuery.length > 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-muted-foreground font-medium uppercase tracking-widest text-sm">{t('search.searching', 'Searching the universe...')}</div>
            </motion.div>
          )}

          {/* Error */}
          {isError && (
            <div className="text-center py-24 text-red-500 font-bold glass-strong rounded-3xl">
              {t('search.error')}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !isError && searchResults?.length === 0 && debouncedQuery.length > 2 && (
            <div className="text-center py-24 text-muted-foreground glass-strong rounded-3xl font-medium">
              {t('search.no_results')} <span className="text-foreground">"{debouncedQuery}"</span>.
            </div>
          )}

          {/* Results Grid */}
          {searchResults && searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {searchResults.map((item, idx) => {
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={`${item.source}-${item.externalId}`} 
                    className="group relative flex flex-col rounded-3xl overflow-hidden bg-card/40 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.3)] hover:-translate-y-2 cursor-pointer"
                    onClick={() => !item.alreadyInLibrary && handleOpenModal(item)}
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                      {item.coverImageUrl ? (
                        <img 
                          src={item.coverImageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-muted-foreground font-bold uppercase text-xs tracking-widest text-center px-4">
                          {t('search.no_image')}
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Action Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
                        {item.alreadyInLibrary ? (
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full p-3 shadow-2xl">
                            <Check className="h-6 w-6" />
                          </div>
                        ) : (
                          <div className="bg-primary text-primary-foreground rounded-full p-4 shadow-[0_0_30px_rgba(var(--primary),0.6)]">
                            <Plus className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-extrabold text-white text-lg leading-tight line-clamp-2 drop-shadow-md">{item.title}</h3>
                        {item.releaseYear > 0 && (
                          <div className="text-white/70 text-xs font-bold mt-1 tracking-widest">{item.releaseYear}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── Premium Glassmorphism Modal ─── */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setSelectedItem(null)}
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              className="relative w-full max-w-4xl flex flex-col md:flex-row bg-card/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Side: Dynamic Poster/Glow */}
              <div className="w-full md:w-5/12 relative aspect-video md:aspect-auto overflow-hidden shrink-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-50"
                  style={{ backgroundImage: `url(${selectedItem.coverImageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/60 md:to-card/90" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {selectedItem.coverImageUrl ? (
                    <img 
                      src={selectedItem.coverImageUrl} 
                      className="w-full max-w-[200px] md:max-w-none md:w-[80%] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 object-cover aspect-[2/3] z-10" 
                    />
                  ) : (
                    <div className="w-full max-w-[200px] md:max-w-none md:w-[80%] aspect-[2/3] bg-muted/50 rounded-2xl border border-white/10 flex items-center justify-center text-muted-foreground font-bold z-10 uppercase tracking-widest text-center px-4">
                      {t('search.no_image')}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: The Form */}
              <div className="flex-1 p-6 md:p-10 flex flex-col justify-center relative z-10">
                <div className="mb-8">
                  <div className="inline-block px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-3">
                    {selectedItem.mediaType}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight mb-2">{selectedItem.title}</h2>
                  {selectedItem.releaseYear > 0 && <p className="text-muted-foreground font-medium">{selectedItem.releaseYear}</p>}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Status Selection (Dynamic Labels) */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('search.modal.status')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Planned', 'InProgress', 'Completed', 'Dropped'].map((s) => (
                        <div 
                          key={s}
                          onClick={() => setValue('status', s as any)}
                          className={cn(
                            "cursor-pointer rounded-xl border p-3 text-center transition-all duration-300 flex items-center justify-center font-bold text-sm",
                            currentStatus === s 
                              ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)] scale-[1.02]" 
                              : "bg-background/50 border-border/50 text-muted-foreground hover:bg-muted/80 hover:border-border"
                          )}
                        >
                          {getStatusLabel(s, selectedItem.mediaType, t)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Rating */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Star className="w-4 h-4" /> {t('search.modal.rating')} <span className="text-[10px] opacity-50">(/10)</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        {...register('rating', { valueAsNumber: true })}
                        className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 px-4 py-2 text-lg font-bold shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                        placeholder="-"
                      />
                    </div>

                    {/* Start Date */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {t('search.modal.started_at', 'Started')}
                      </label>
                      <input
                        type="date"
                        {...register('startedAt')}
                        className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 px-4 py-2 text-sm font-medium shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Finish Date (Only show if completed or dropped or just let them add it anyway, let's always show it next to review or just keep it simple) */}
                  {(currentStatus === 'Completed' || currentStatus === 'Dropped') && (
                    <div className="space-y-3 animate-in slide-in-from-top-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {t('search.modal.finished_at', 'Finished')}
                      </label>
                      <input
                        type="date"
                        {...register('finishedAt')}
                        className="flex h-12 w-full rounded-xl border border-white/10 bg-background/50 px-4 py-2 text-sm font-medium shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all [color-scheme:dark]"
                      />
                    </div>
                  )}

                  {/* Review */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('search.modal.review')}</label>
                    <textarea
                      {...register('review')}
                      className="flex min-h-[100px] w-full rounded-xl border border-white/10 bg-background/50 px-4 py-3 text-sm font-medium shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all resize-none"
                      placeholder={t('search.modal.review_placeholder', 'Write your thoughts...')}
                    />
                  </div>

                  {/* Privacy & Submit */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-3 bg-background/50 px-4 py-2 rounded-xl border border-white/5">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        {...register('isPrivate')}
                        className="h-5 w-5 rounded-md border-white/20 text-primary focus:ring-primary bg-background"
                      />
                      <label htmlFor="isPrivate" className="text-sm font-bold text-muted-foreground select-none cursor-pointer">
                        {t('search.modal.is_private')}
                      </label>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full sm:w-auto rounded-xl px-8 h-12 shadow-[0_10px_30px_-10px_rgba(var(--primary),0.5)] font-bold text-base"
                      disabled={isSubmitting || importMutation.isPending || createEntryMutation.isPending}
                    >
                      {(isSubmitting || importMutation.isPending || createEntryMutation.isPending) ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5 mr-2" />
                      )}
                      {t('search.add_to_timeline')}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
