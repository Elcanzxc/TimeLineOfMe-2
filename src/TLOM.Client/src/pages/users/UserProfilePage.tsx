import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Button } from '@/shared/ui/Button';
import { Loader2, UserPlus, UserMinus, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { motion } from 'framer-motion';

interface UserProfileDto {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
}

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const isMe = currentUser?.username === username;

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      const res = await apiClient.get(`/api/users/${username}`);
      return res.data as UserProfileDto;
    },
    enabled: !!username,
  });

  // We check if current user is following this profile
  const { data: followingList } = useQuery({
    queryKey: ['following', currentUser?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/users/${currentUser?.id}/following`);
      return res.data as { followingId: string }[];
    },
    enabled: !!currentUser?.id && !isMe,
  });

  const isFollowing = followingList?.some(f => f.followingId === profile?.id) || false;

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await apiClient.delete(`/api/users/${profile?.id}/follow`);
      } else {
        await apiClient.post(`/api/users/${profile?.id}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', username] });
    }
  });

  const { data: entries, isLoading: isEntriesLoading } = useQuery({
    queryKey: ['timeline', profile?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/users/${profile?.id}/entries`);
      return res.data as any[];
    },
    enabled: !!profile?.id,
  });

  if (isProfileLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  if (!profile) return <div className="p-20 text-center">User not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 w-full space-y-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-card border rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-accent/20" />
        
        <div className="relative z-10 h-32 w-32 rounded-full border-4 border-background bg-muted flex items-center justify-center text-5xl font-bold text-muted-foreground uppercase overflow-hidden shrink-0 shadow-lg mt-10 md:mt-0">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.username} className="h-full w-full object-cover" />
          ) : (
            profile.username.charAt(0)
          )}
        </div>
        
        <div className="relative z-10 flex-1 text-center md:text-left pt-4 md:pt-14 flex flex-col md:flex-row md:justify-between md:items-end gap-6 w-full">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center justify-center md:justify-start gap-2">
              {profile.firstName || profile.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : profile.username}
              {profile.followersCount > 100 && <ShieldCheck className="h-6 w-6 text-primary" />}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 text-center md:text-left">@{profile.username}</p>
            
            {profile.bio && <p className="text-foreground mt-3 max-w-md text-center md:text-left">{profile.bio}</p>}
            
            {(profile.city || profile.country || profile.dateOfBirth) && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-muted-foreground justify-center md:justify-start">
                {(profile.city || profile.country) && (
                  <span className="flex items-center gap-1">📍 {[profile.city, profile.country].filter(Boolean).join(', ')}</span>
                )}
                {profile.dateOfBirth && (
                  <span className="flex items-center gap-1">🎂 {new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                )}
              </div>
            )}
            
            <div className="flex gap-6 mt-6 justify-center md:justify-start">
              <div className="text-center md:text-left">
                <span className="font-bold text-lg">{profile.followersCount}</span>
                <span className="text-xs text-muted-foreground block uppercase font-semibold">Followers</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-bold text-lg">{profile.followingCount}</span>
                <span className="text-xs text-muted-foreground block uppercase font-semibold">Following</span>
              </div>
            </div>
          </div>
          
          <div className="flex shrink-0">
            {isMe ? (
              <Button 
                variant="outline" 
                className="rounded-full px-6"
                onClick={() => window.location.href = '/settings'}
              >
                Edit Profile
              </Button>
            ) : (
            <Button 
              size="lg" 
              variant={isFollowing ? "outline" : "default"}
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className="rounded-full px-8 shrink-0"
            >
              {followMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 
               isFollowing ? <><UserMinus className="h-4 w-4 mr-2" /> Unfollow</> : 
               <><UserPlus className="h-4 w-4 mr-2" /> Follow</>}
            </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mini Timeline View */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{profile.username}'s Timeline</h2>
        
        {isEntriesLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : !entries || entries.length === 0 ? (
          <div className="p-10 text-center bg-muted/20 border border-dashed rounded-xl text-muted-foreground">
            This user hasn't added anything to their timeline yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {entries.map((entry: any, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="rounded-xl overflow-hidden shadow-sm border bg-card relative aspect-[2/3] group">
                  {entry.mediaItem.imageUrl ? (
                    <img src={entry.mediaItem.imageUrl} alt={entry.mediaItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs text-center p-2">
                      {entry.mediaItem.title}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-[10px] font-bold text-white uppercase px-1.5 py-0.5 rounded bg-primary/80">
                      {entry.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
