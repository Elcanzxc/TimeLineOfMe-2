import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/Card';
import { apiClient } from '@/shared/api/apiClient';
import { cn } from '@/shared/lib/utils';
import { Search, Loader2, Plus } from 'lucide-react';

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

interface MediaItemDto {
  id: string; // If imported
  title: string;
  creator: string;
  releaseYear?: number;
  imageUrl?: string;
  externalId: string;
  externalSource: string;
  mediaType: MediaType;
  isImported: boolean;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('Movie');
  const debouncedQuery = useDebounce(query, 500);
  const navigate = useNavigate();

  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['mediaSearch', debouncedQuery, mediaType],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const res = await apiClient.get('/api/mediaitems/search', {
        params: { query: debouncedQuery, mediaType }
      });
      return res.data as MediaItemDto[];
    },
    enabled: debouncedQuery.length > 2,
  });

  const importMutation = useMutation({
    mutationFn: async (item: MediaItemDto) => {
      if (item.isImported && item.id) return item.id;
      
      const res = await apiClient.post('/api/mediaitems/import', {
        externalId: item.externalId,
        source: item.externalSource,
        mediaType: item.mediaType
      });
      return res.data.id as string;
    }
  });

  const createEntryMutation = useMutation({
    mutationFn: async (mediaItemId: string) => {
      const res = await apiClient.post('/api/entries', {
        mediaItemId,
        status: 'Planned', // Default status
        isPrivate: false,
        rating: null,
        review: null
      });
      return res.data;
    },
    onSuccess: (data) => {
      navigate(`/entry/${data.id}`);
    }
  });

  const handleAdd = async (item: MediaItemDto) => {
    try {
      const mediaItemId = await importMutation.mutateAsync(item);
      await createEntryMutation.mutateAsync(mediaItemId);
    } catch (err) {
      console.error('Failed to add entry', err);
      alert('Failed to add entry. See console for details.');
    }
  };

  const tabs: { label: string; value: MediaType }[] = [
    { label: 'Movies', value: 'Movie' },
    { label: 'Games', value: 'Game' },
    { label: 'Books', value: 'Book' },
    { label: 'Music', value: 'Music' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Find Content</h1>
        <p className="text-muted-foreground">Search across databases to add items to your timeline.</p>
        
        {/* Search Input */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, games, books, or albums..."
            className="pl-10 h-12 text-lg rounded-full"
          />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-muted rounded-full w-fit gap-1">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setMediaType(tab.value)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                mediaType === tab.value 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="min-h-[400px]">
        {isLoading && debouncedQuery.length > 2 && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-destructive">
            An error occurred while fetching results.
          </div>
        )}

        {!isLoading && !isError && searchResults?.length === 0 && debouncedQuery.length > 2 && (
          <div className="text-center py-12 text-muted-foreground">
            No results found for "{debouncedQuery}".
          </div>
        )}

        {searchResults && searchResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {searchResults.map((item) => {
              const isProcessing = importMutation.isPending || createEntryMutation.isPending;
              
              return (
                <Card key={`${item.externalSource}-${item.externalId}`} className="overflow-hidden flex flex-col group border-transparent hover:border-primary/50 transition-colors bg-card/50">
                  <div className="relative aspect-[2/3] bg-muted w-full overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                      <Button 
                        onClick={() => handleAdd(item)}
                        disabled={isProcessing}
                        className="w-full rounded-full shadow-lg"
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add to Timeline
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm line-clamp-1" title={item.title}>{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1 flex-1">
                      {item.creator}
                    </p>
                    {item.releaseYear && (
                      <span className="text-xs font-medium bg-muted w-fit px-2 py-0.5 rounded-md mt-2">
                        {item.releaseYear}
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
