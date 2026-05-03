import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Loader2, MessageSquare, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';

export function FeedPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = null }) => {
      const res = await apiClient.get('/api/entries', {
        params: { cursor: pageParam, pageSize: 10 }
      });
      return res.data; // { items: [...], nextCursor: '...' }
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
  });

  if (status === 'pending') {
    return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (status === 'error') {
    return <div className="p-20 text-center text-destructive">Failed to load feed.</div>;
  }

  const items = data.pages.flatMap((page) => page.items);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 w-full space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Activity Feed</h1>
        <p className="text-muted-foreground mt-2">See what your friends are adding to their timelines.</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
          <h3 className="text-xl font-bold mb-2">Your feed is empty</h3>
          <p className="text-muted-foreground mb-6">Follow more people to see their activity here.</p>
          <Button asChild>
            <Link to="/users">Find Users</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((entry: any, i: number) => (
            <motion.div 
              key={`${entry.id}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-2xl p-4 sm:p-6 shadow-sm"
            >
              <div className="flex gap-4">
                {/* Poster */}
                <Link to={`/entry/${entry.id}`} className="shrink-0 w-20 h-28 sm:w-28 sm:h-40 rounded-lg overflow-hidden bg-muted border">
                  {entry.mediaItem.imageUrl ? (
                    <img src={entry.mediaItem.imageUrl} alt={entry.mediaItem.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">No Image</div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  {/* User Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <Link to={`/users/${entry.userId}`} className="font-bold text-sm hover:underline hover:text-primary">
                      {/* Note: In a real app, the backend feed query should join User Profile data so we have Username here.
                          If it doesn't, we just display 'A user'. */}
                      @{entry.userProfile?.username || 'user'}
                    </Link>
                    <span className="text-xs text-muted-foreground">• updated their timeline</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold leading-tight mb-1">{entry.mediaItem.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted uppercase">{entry.mediaItem.mediaType}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">{entry.status}</span>
                    {entry.rating && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-600">★ {entry.rating}</span>
                    )}
                  </div>

                  {entry.review && (
                    <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-md mb-4 border-l-2 border-primary/50">
                      "{entry.review}"
                    </p>
                  )}

                  <div className="mt-auto flex gap-4 pt-4 border-t">
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" /> Like
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-blue-500 transition-colors">
                      <MessageSquare className="h-4 w-4" /> Comment
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
            className="rounded-full px-8"
          >
            {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
