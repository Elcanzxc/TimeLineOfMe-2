import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { apiClient } from "@/shared/api/apiClient";
import { Loader2, Settings } from "lucide-react";

const settingsSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  dateOfBirth: z.string().optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', user?.username],
    queryFn: async () => {
      const res = await apiClient.get(`/api/users/${user?.username}`);
      return res.data;
    },
    enabled: !!user?.username,
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : "",
        bio: profile.bio || "",
        city: profile.city || "",
        country: profile.country || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile, reset]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      let finalAvatarUrl = data.avatarUrl;
      
      // If a file was selected, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await apiClient.post("/api/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        finalAvatarUrl = uploadRes.data.url;
      }

      await apiClient.put("/api/users/me", { ...data, avatarUrl: finalAvatarUrl });
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.username] });
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 w-full space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information and avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>
              <div className="flex items-center gap-4">
                {profile?.avatarUrl && !selectedFile && (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
                )}
                {selectedFile && (
                  <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input {...register("firstName")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input {...register("lastName")} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth</label>
              <Input type="date" {...register("dateOfBirth")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input {...register("city")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input {...register("country")} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                placeholder="Tell us about yourself..."
                className="h-24 resize-none"
                {...register("bio")}
              />
            </div>

            {mutation.isError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                Failed to update profile.
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm font-medium">
                Profile updated successfully!
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
              {(isSubmitting || mutation.isPending) ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
