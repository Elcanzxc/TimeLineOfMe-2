import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/shared/api/apiClient';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Loader2, ArrowLeft, Trash2, Save } from 'lucide-react';
import { useEffect } from 'react';

const updateEntrySchema = z.object({
  status: z.enum(['Planned', 'InProgress', 'Completed', 'Dropped']),
  rating: z.number().min(1).max(10).nullable().optional(),
  review: z.string().max(2000).nullable().optional(),
  isPrivate: z.boolean()
});

type UpdateEntryForm = z.infer<typeof updateEntrySchema>;

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

export function EntryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: entry, isLoading, isError } = useQuery({
    queryKey: ['entry', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/entries/${id}`);
      return res.data as EntryDto;
    },
    enabled: !!id,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { isDirty, isSubmitting } } = useForm<UpdateEntryForm>({
    resolver: zodResolver(updateEntrySchema),
    defaultValues: {
      status: 'Planned',
      rating: null,
      review: '',
      isPrivate: false
    }
  });

  const currentStatus = watch('status');

  useEffect(() => {
    if (entry) {
      reset({
        status: entry.status,
        rating: entry.rating,
        review: entry.review || '',
        isPrivate: entry.isPrivate
      });
    }
  }, [entry, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateEntryForm) => {
      const res = await apiClient.put(`/api/entries/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entry', id] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/api/entries/${id}`);
    },
    onSuccess: () => {
      navigate('/dashboard');
    }
  });

  const onSubmit = async (data: UpdateEntryForm) => {
    try {
      await updateMutation.mutateAsync(data);
    } catch (error) {
      console.error("Failed to update entry", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this from your timeline?")) {
      try {
        await deleteMutation.mutateAsync();
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !entry) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
        <p className="text-xl font-medium text-destructive">Failed to load entry.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 w-full">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Poster & Info */}
        <div className="col-span-1 space-y-6">
          <div className="rounded-xl overflow-hidden shadow-lg border bg-muted aspect-[2/3] relative">
            {entry.mediaItem.imageUrl ? (
              <img 
                src={entry.mediaItem.imageUrl} 
                alt={entry.mediaItem.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">{entry.mediaItem.title}</h1>
            <p className="text-muted-foreground text-lg">{entry.mediaItem.creator}</p>
            <div className="flex gap-2 mt-3">
              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase">
                {entry.mediaItem.mediaType}
              </span>
              {entry.mediaItem.releaseYear && (
                <span className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-semibold">
                  {entry.mediaItem.releaseYear}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Controls & Edit Form */}
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Timeline Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Status Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Status</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Planned', 'InProgress', 'Completed', 'Dropped'].map((s) => (
                      <div 
                        key={s}
                        onClick={() => setValue('status', s as any, { shouldDirty: true })}
                        className={`cursor-pointer rounded-md border p-3 text-center transition-all ${
                          currentStatus === s 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                            : 'hover:bg-muted/50 border-input text-muted-foreground'
                        }`}
                      >
                        <span className="text-sm font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                {(currentStatus === 'Completed' || currentStatus === 'Dropped' || currentStatus === 'InProgress') && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Your Rating (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      {...register('rating', { valueAsNumber: true })}
                      className="flex h-10 w-full md:w-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="e.g. 8"
                    />
                  </div>
                )}

                {/* Review/Notes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Review or Notes</label>
                  <textarea
                    {...register('review')}
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Write your thoughts..."
                  />
                </div>

                {/* Privacy */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    {...register('isPrivate')}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isPrivate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Make this entry private
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={!isDirty || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
