import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { apiClient } from "@/shared/api/apiClient";
import { Loader2, Settings, Camera, User, MapPin, Calendar, Lock, Globe, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const settingsSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  dateOfBirth: z.string().optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isProfilePrivate: z.boolean().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function SettingsPage() {
  const { t } = useTranslation();
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

  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<SettingsForm>({
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
        isProfilePrivate: profile.isProfilePrivate || false,
      });
    }
  }, [profile, reset]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      let finalAvatarUrl = data.avatarUrl;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await apiClient.post("/api/files/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        finalAvatarUrl = uploadRes.data.url;
      }
      await apiClient.put("/api/users/profile", { ...data, avatarUrl: finalAvatarUrl });
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.username] });
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  const avatarPreview = selectedFile ? URL.createObjectURL(selectedFile) : profile?.avatarUrl;

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-background relative overflow-hidden py-12">
      <div className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] bottom-0 -right-40 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            <Settings className="w-3.5 h-3.5" /> {t('settings.badge', 'Account Settings')}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight">{t('settings.title', 'Settings')}</h1>
          <p className="text-muted-foreground mt-2 font-medium">{t('settings.subtitle', 'Manage your profile and preferences.')}</p>
        </motion.div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
          {/* Avatar Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-strong rounded-3xl p-6 md:p-8 border border-white/5">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> {t('settings.avatar', 'Profile Photo')}</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-muted border-4 border-background shadow-xl">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground uppercase">{user?.username?.charAt(0)}</div>
                  )}
                </div>
                <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.length) setSelectedFile(e.target.files[0]); }} />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-lg">@{user?.username}</p>
                <p className="text-sm text-muted-foreground">{t('settings.avatar_hint', 'Click the photo to change it')}</p>
              </div>
            </div>
          </motion.div>

          {/* Personal Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-strong rounded-3xl p-6 md:p-8 border border-white/5">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> {t('settings.personal_info', 'Personal Information')}</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('settings.first_name', 'First Name')}</label>
                  <Input {...register("firstName")} className="h-12 rounded-xl bg-background/50 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('settings.last_name', 'Last Name')}</label>
                  <Input {...register("lastName")} className="h-12 rounded-xl bg-background/50 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> {t('settings.date_of_birth', 'Date of Birth')}</label>
                <Input type="date" {...register("dateOfBirth")} className="h-12 rounded-xl bg-background/50 border-white/10 [color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('settings.bio', 'Bio')}</label>
                <Textarea placeholder={t('settings.bio_placeholder', 'Tell us about yourself...')} className="min-h-[120px] rounded-xl bg-background/50 border-white/10 resize-none" {...register("bio")} />
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-strong rounded-3xl p-6 md:p-8 border border-white/5">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> {t('settings.location', 'Location')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('settings.city', 'City')}</label>
                <Input {...register("city")} className="h-12 rounded-xl bg-background/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('settings.country', 'Country')}</label>
                <Input {...register("country")} className="h-12 rounded-xl bg-background/50 border-white/10" />
              </div>
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-strong rounded-3xl p-6 md:p-8 border border-white/5">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> {t('settings.privacy', 'Privacy')}</h2>
            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Globe className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="font-bold text-sm">{t('settings.private_profile', 'Private Profile')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.private_desc', 'Hidden from public view')}</p>
                </div>
              </div>
              <input type="checkbox" id="isProfilePrivate" {...register('isProfilePrivate')} className="h-5 w-5 rounded-md border-white/20 text-primary focus:ring-primary bg-background" />
            </div>
          </motion.div>

          {/* Status Messages */}
          {mutation.isError && (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {t('settings.error', 'Failed to update profile.')}
            </div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-green-500/10 text-green-500 text-sm font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> {t('settings.success', 'Profile updated successfully!')}
            </motion.div>
          )}

          {/* Submit */}
          <div className="flex justify-end pb-12">
            <Button type="submit" size="lg" className="rounded-xl px-10 h-14 text-base font-bold shadow-[0_10px_30px_-10px_rgba(var(--primary),0.5)]" disabled={isSubmitting || mutation.isPending || (!isDirty && !selectedFile)}>
              {(isSubmitting || mutation.isPending) ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {t('settings.save', 'Save Changes')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
