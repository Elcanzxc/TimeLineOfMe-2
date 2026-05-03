import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Input } from '@/shared/ui/Input';
import { Card, CardContent } from '@/shared/ui/Card';
import { apiClient } from '@/shared/api/apiClient';
import { Search, Loader2, Users } from 'lucide-react';

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

interface UserSearchDto {
  id: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
}

export function UsersSearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const { data: users, isLoading } = useQuery({
    queryKey: ['usersSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      const res = await apiClient.get('/api/users/search', {
        params: { query: debouncedQuery }
      });
      return res.data as UserSearchDto[];
    },
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 w-full space-y-8">
      <div className="text-center space-y-4">
        <Users className="h-12 w-12 mx-auto text-primary opacity-80" />
        <h1 className="text-4xl font-extrabold tracking-tight">Find Friends</h1>
        <p className="text-muted-foreground text-lg">Search for other travelers by their username.</p>
        
        <div className="relative max-w-xl mx-auto mt-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a username..."
            className="pl-10 h-12 text-lg rounded-full"
          />
        </div>
      </div>

      <div className="min-h-[300px]">
        {isLoading && debouncedQuery.length >= 2 && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && users?.length === 0 && debouncedQuery.length >= 2 && (
          <div className="text-center py-12 text-muted-foreground">
            No users found matching "{debouncedQuery}".
          </div>
        )}

        {users && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {users.map((user) => (
              <Link to={`/users/${user.username}`} key={user.id}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card/50">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase overflow-hidden shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
                      ) : (
                        user.username.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight truncate">{user.username}</h3>
                      {user.bio ? (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{user.bio}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic mt-1">No bio provided</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
