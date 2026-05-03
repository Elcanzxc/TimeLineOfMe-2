import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Filter } from 'lucide-react';
import { apiClient } from '@/shared/api/apiClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Button } from '@/shared/ui/Button';

interface MediaItemDto {
  title: string;
  creator: string;
  releaseYear: number | null;
  imageUrl: string | null;
  mediaType: string;
}

interface EntryDto {
  id: string;
  status: 'Planned' | 'InProgress' | 'Completed' | 'Dropped';
  isPrivate: boolean;
  rating: number | null;
  review: string | null;
  createdAt: string;
  updatedAt: string;
  mediaItem: MediaItemDto;
}

export function TimelinePage() {
  const user = useAuthStore((state) => state.user);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const { data: entries, isLoading, isError } = useQuery({
    queryKey: ['timeline', user?.id],
    queryFn: async () => {
      // Имитируем запрос, если бы бэкенд возвращал конкретный таймлайн.
      // Если метод не реализован на бэкенде, можно временно брать из глобального /api/entries 
      // Но по документации есть /api/users/{userId}/entries
      const res = await apiClient.get(`/api/users/${user?.id}/entries`);
      
      // Сортируем по дате обновления (сначала новые)
      const data = res.data as EntryDto[];
      return data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !entries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center space-y-4">
        <p className="text-xl font-medium text-destructive">Failed to load timeline.</p>
      </div>
    );
  }

  // Фильтрация на клиенте
  const filteredEntries = entries.filter(entry => {
    const matchType = filterType === 'All' || entry.mediaItem.mediaType === filterType;
    const matchStatus = filterStatus === 'All' || entry.status === filterStatus;
    return matchType && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 w-full space-y-12">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">My Timeline</h1>
          <p className="text-muted-foreground mt-2 text-lg">The story of your media experiences.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-muted/50 p-2 rounded-xl">
          <div className="flex items-center gap-2 px-3 border-r border-border/50">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters</span>
          </div>
          
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Movie">Movies</option>
            <option value="Game">Games</option>
            <option value="Book">Books</option>
            <option value="Music">Music</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="InProgress">In Progress</option>
            <option value="Planned">Planned</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
          <h3 className="text-2xl font-bold mb-2">It's a bit empty here</h3>
          <p className="text-muted-foreground mb-6">You haven't added any media matching these filters yet.</p>
          <Button asChild>
            <Link to="/search">Find Content to Add</Link>
          </Button>
        </div>
      ) : (
        <div className="relative py-10">
          {/* Vertical Line */}
          <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-1 bg-muted rounded-full -translate-x-1/2" />

          {/* Timeline Items */}
          <div className="flex flex-col gap-16 md:gap-24">
            {filteredEntries.map((entry, index) => {
              const isEven = index % 2 === 0;
              const date = new Date(entry.updatedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });

              return (
                <motion.div 
                  key={entry.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className={`relative flex items-center ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}
                >
                  {/* Circle Marker */}
                  <div className="absolute left-[30px] md:left-1/2 w-4 h-4 rounded-full bg-background border-4 border-primary z-10 -translate-x-1/2 shadow-sm" />
                  
                  {/* Content */}
                  <div className={`w-full md:w-1/2 pl-[60px] ${isEven ? 'md:pl-16 text-left' : 'md:pr-16 md:text-right md:pl-0'}`}>
                    <Link to={`/entry/${entry.id}`} className="block group">
                      <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all hover:border-primary/50 relative overflow-hidden">
                        
                        {/* Background Image Blur (Optional aesthetic) */}
                        {entry.mediaItem.imageUrl && (
                          <div 
                            className="absolute inset-0 opacity-[0.03] bg-cover bg-center" 
                            style={{ backgroundImage: `url(${entry.mediaItem.imageUrl})` }}
                          />
                        )}

                        <div className="relative z-10">
                          <span className="text-xs font-bold text-muted-foreground mb-2 block">{date}</span>
                          
                          <div className={`flex items-start gap-4 ${!isEven && 'md:flex-row-reverse'}`}>
                            {/* Small Poster */}
                            {entry.mediaItem.imageUrl && (
                              <img 
                                src={entry.mediaItem.imageUrl} 
                                alt={entry.mediaItem.title}
                                className="w-16 h-24 object-cover rounded-md shadow-sm flex-shrink-0"
                              />
                            )}
                            
                            <div className={`${!isEven && 'md:text-right'}`}>
                              <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                {entry.mediaItem.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">{entry.mediaItem.creator}</p>
                              
                              <div className={`flex flex-wrap gap-2 ${!isEven && 'md:justify-end'}`}>
                                <span className="inline-block px-2 py-0.5 bg-muted text-[10px] uppercase font-bold rounded">
                                  {entry.mediaItem.mediaType}
                                </span>
                                <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded ${getStatusColor(entry.status)}`}>
                                  {entry.status}
                                </span>
                                {entry.rating && (
                                  <span className="inline-block px-2 py-0.5 bg-yellow-500/10 text-yellow-600 text-[10px] font-bold rounded">
                                    ★ {entry.rating}/10
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {entry.review && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <p className="text-sm text-muted-foreground line-clamp-3 italic">"{entry.review}"</p>
                            </div>
                          )}
                        </div>

                      </div>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch(status) {
    case 'Completed': return 'bg-green-500/10 text-green-600';
    case 'InProgress': return 'bg-blue-500/10 text-blue-600';
    case 'Planned': return 'bg-orange-500/10 text-orange-600';
    case 'Dropped': return 'bg-destructive/10 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
}
