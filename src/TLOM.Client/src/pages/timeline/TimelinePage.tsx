import { useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Activity, PlayCircle, BookOpen, Music, Gamepad2, Compass } from 'lucide-react';
import { apiClient } from '@/shared/api/apiClient';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotificationStore } from '@/features/notifications/store/useNotificationStore';
import { Button } from '@/shared/ui/Button';

interface EntryDto {
  id: string;
  mediaItemTitle: string;
  mediaItemCoverImageUrl: string | null;
  mediaType: string;
  status: 'Planned' | 'InProgress' | 'Completed' | 'Dropped';
  isPrivate: boolean;
  rating: number | null;
  review: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  genres: string[];
}

// Helper to group entries by Year -> Month
function groupEntriesByEra(entries: EntryDto[]) {
  const grouped: Record<string, Record<string, EntryDto[]>> = {};
  
  entries.forEach(entry => {
    // Use StartedAt, FinishedAt, or CreatedAt for timeline placement
    const dateStr = entry.startedAt || entry.createdAt;
    const date = new Date(dateStr);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('en-US', { month: 'long' });

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];
    
    grouped[year][month].push(entry);
  });

  // Sort years descending
  const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  
  // Sort months descending for each year
  const monthOrder = ["December", "November", "October", "September", "August", "July", "June", "May", "April", "March", "February", "January"];
  
  const result: { year: string, months: { month: string, entries: EntryDto[] }[] }[] = [];
  
  for (const year of sortedYears) {
    const monthsObj = grouped[year];
    const sortedMonths = Object.keys(monthsObj).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    result.push({
      year,
      months: sortedMonths.map(m => ({ month: m, entries: monthsObj[m] }))
    });
  }

  return result;
}

// Media DNA Dashboard Component
function MediaDNA({ entries }: { entries: EntryDto[] }) {
  const { t } = useTranslation();
  
  const stats = useMemo(() => {
    const total = entries.length;
    let movies = 0, games = 0, books = 0, music = 0;
    const genres: Record<string, number> = {};
    let totalRating = 0;
    let ratedCount = 0;

    entries.forEach(e => {
      if (e.mediaType === 'Movie') movies++;
      if (e.mediaType === 'Game') games++;
      if (e.mediaType === 'Book') books++;
      if (e.mediaType === 'Music') music++;

      if (e.rating) {
        totalRating += e.rating;
        ratedCount++;
      }

      e.genres?.forEach(g => {
        genres[g] = (genres[g] || 0) + 1;
      });
    });

    const topGenres = Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total,
      movies, games, books, music,
      avgRating: ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : '-',
      topGenres
    };
  }, [entries]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-8 mb-16 shadow-2xl border border-white/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-display font-bold">{t('timeline.media_dna')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Stats */}
        <div className="bg-background/50 rounded-2xl p-5 border border-border/50">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('timeline.total_journey')}</div>
          <div className="text-4xl font-black text-foreground">{stats.total} <span className="text-lg text-muted-foreground font-medium">{t('timeline.entries')}</span></div>
        </div>

        {/* Avg Rating */}
        <div className="bg-background/50 rounded-2xl p-5 border border-border/50">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('timeline.avg_rating')}</div>
          <div className="text-4xl font-black text-yellow-500">{stats.avgRating} <span className="text-lg text-yellow-500/50 font-medium">/10</span></div>
        </div>

        {/* Type Distribution */}
        <div className="bg-background/50 rounded-2xl p-5 border border-border/50 lg:col-span-2">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{t('timeline.distribution')}</div>
          <div className="flex items-center gap-4">
            <StatItem icon={<PlayCircle className="w-4 h-4 text-blue-500" />} count={stats.movies} total={stats.total} color="bg-blue-500" />
            <StatItem icon={<Gamepad2 className="w-4 h-4 text-emerald-500" />} count={stats.games} total={stats.total} color="bg-emerald-500" />
            <StatItem icon={<BookOpen className="w-4 h-4 text-amber-500" />} count={stats.books} total={stats.total} color="bg-amber-500" />
            <StatItem icon={<Music className="w-4 h-4 text-purple-500" />} count={stats.music} total={stats.total} color="bg-purple-500" />
          </div>
        </div>
      </div>

      {/* Top Genres */}
      {stats.topGenres.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mr-2">{t('timeline.top_genres')}</span>
          {stats.topGenres.map(([genre, count], idx) => (
            <div key={genre} className="px-3 py-1.5 rounded-lg bg-card/50 border border-border/50 text-sm font-bold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-accent' : 'bg-muted-foreground'}`} />
              {genre} <span className="text-muted-foreground text-xs">({count})</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StatItem({ icon, count, total, color }: { icon: any, count: number, total: number, color: string }) {
  if (total === 0) return null;
  const percentage = Math.round((count / total) * 100);
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">{icon} <span className="text-xs font-bold">{count}</span></div>
        <span className="text-[10px] text-muted-foreground font-bold">{percentage}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export function TimelinePage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const connection = useNotificationStore((s) => s.connection);
  const queryClient = useQueryClient();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Real-time updates
  useEffect(() => {
    if (!connection) return;
    const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['timeline', user?.userProfileId] });
    
    connection.on('EntryLiked', handleRefresh);
    connection.on('NewComment', handleRefresh);
    connection.on('FollowChanged', handleRefresh);
    connection.on('EntryDeleted', handleRefresh);
    connection.on('ReceiveNotification', handleRefresh);

    return () => {
      connection.off('EntryLiked', handleRefresh);
      connection.off('NewComment', handleRefresh);
      connection.off('FollowChanged', handleRefresh);
      connection.off('EntryDeleted', handleRefresh);
      connection.off('ReceiveNotification', handleRefresh);
    };
  }, [connection, queryClient, user?.userProfileId]);

  const { data: entriesData, isLoading } = useQuery({
    queryKey: ['timeline', user?.userProfileId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/entries/user/${user?.userProfileId}?pageSize=100`);
      return res.data;
    },
    enabled: !!user?.userProfileId,
  });

  const entries: EntryDto[] = entriesData?.items || [];
  const groupedEras = useMemo(() => groupEntriesByEra(entries), [entries]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background relative" ref={containerRef}>
      {/* Dynamic Background Blob */}
      <div className="fixed top-1/2 left-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative z-10 flex gap-8">
        
        {/* Main Content */}
        <div className="flex-1 w-full max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-4">{t('timeline.title')}</h1>
            <p className="text-xl text-muted-foreground font-medium">{t('timeline.subtitle')}</p>
          </div>

          <MediaDNA entries={entries} />

          {entries.length === 0 ? (
            <div className="text-center py-24 glass rounded-3xl">
              <Compass className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
              <h3 className="text-3xl font-bold mb-3">{t('timeline.empty_title')}</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg">{t('timeline.empty_desc')}</p>
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/search">{t('timeline.find_content')}</Link>
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Glowing Timeline Line */}
              <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-background rounded-full -translate-x-1/2 opacity-30" />

              <div className="flex flex-col gap-24 py-10">
                {groupedEras.map((era) => (
                  <div key={era.year} id={`year-${era.year}`} className="relative">
                    {/* Year Header */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="sticky top-24 z-20 flex justify-center mb-16"
                    >
                      <div className="bg-background/80 backdrop-blur-xl border border-primary/30 px-8 py-3 rounded-full shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-display">{era.year}</span>
                      </div>
                    </motion.div>

                    {/* Months */}
                    <div className="flex flex-col gap-16">
                      {era.months.map((monthData) => (
                        <div key={monthData.month}>
                          <h4 className="text-center text-xl font-bold text-muted-foreground mb-12 uppercase tracking-widest">{monthData.month}</h4>
                          <div className="flex flex-col gap-12">
                            {monthData.entries.map((entry, index) => {
                              const isEven = index % 2 === 0;
                              return (
                                <TimelineCard key={entry.id} entry={entry} isEven={isEven} />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Journey Minimap (Scroll Spy Sidebar) */}
        {entries.length > 0 && (
          <div className="hidden lg:block w-48 shrink-0 relative">
            <div className="sticky top-32 flex flex-col gap-4 border-l border-border/50 pl-6 py-4">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{t('timeline.jump_to_year')}</div>
              {groupedEras.map(era => (
                <button
                  key={era.year}
                  onClick={() => {
                    document.getElementById(`year-${era.year}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-left text-2xl font-black text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
                >
                  <span className="absolute -left-[30px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-border group-hover:bg-primary transition-colors" />
                  {era.year}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineCard({ entry, isEven }: { entry: EntryDto, isEven: boolean }) {
  const { t } = useTranslation();
  
  // Create a display date from StartedAt or CreatedAt
  const displayDate = new Date(entry.startedAt || entry.createdAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      className={`relative flex items-center ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row group`}
    >
      {/* Node Marker */}
      <div className="absolute left-[20px] md:left-1/2 w-6 h-6 rounded-full bg-background border-4 border-primary z-10 -translate-x-1/2 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:scale-125 transition-transform duration-500">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      </div>
      
      <div className={`w-full md:w-1/2 pl-12 ${isEven ? 'md:pl-16 text-left' : 'md:pr-16 md:text-right md:pl-0'}`}>
        <Link to={`/entry/${entry.id}`} className="block">
          <div className="glass-strong rounded-[2rem] p-5 shadow-xl border border-white/5 relative overflow-hidden group-hover:-translate-y-2 transition-all duration-500 flex flex-col sm:flex-row gap-5 hover:shadow-[0_20px_40px_rgba(var(--primary),0.1)]">
            
            {/* Dynamic Background Glow based on Poster */}
            {entry.mediaItemCoverImageUrl && (
              <div 
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url(${entry.mediaItemCoverImageUrl})` }}
              />
            )}

            {/* Poster */}
            <div className={`shrink-0 w-24 h-36 rounded-xl overflow-hidden bg-muted relative z-10 shadow-md ${!isEven && 'sm:order-2'}`}>
              {entry.mediaItemCoverImageUrl ? (
                <img src={entry.mediaItemCoverImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={entry.mediaItemTitle} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase text-center bg-muted/50 p-2">{t('timeline.no_image')}</div>
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <span className="text-xs font-bold text-primary mb-2 block tracking-widest">{displayDate}</span>
              <h3 className="text-2xl font-display font-bold mb-2 text-foreground line-clamp-2">{entry.mediaItemTitle}</h3>
              
              <div className={`flex flex-wrap items-center gap-2 mb-3 ${isEven ? 'justify-start' : 'sm:justify-end justify-start'}`}>
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md">{entry.status}</span>
                <span className="px-2.5 py-1 bg-muted/80 backdrop-blur-md text-foreground text-[10px] font-bold uppercase tracking-widest rounded-md">{entry.mediaType}</span>
                {entry.rating && (
                  <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-600 text-[10px] font-bold uppercase tracking-widest rounded-md">★ {entry.rating}/10</span>
                )}
              </div>

              {entry.review && (
                <p className="text-muted-foreground font-medium text-sm leading-relaxed line-clamp-2 italic">"{entry.review}"</p>
              )}
            </div>

          </div>
        </Link>
      </div>
    </motion.div>
  );
}
