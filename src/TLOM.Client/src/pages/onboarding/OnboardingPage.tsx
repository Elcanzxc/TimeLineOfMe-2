import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { apiClient } from "@/shared/api/apiClient";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { UserCircle, ArrowRight, ArrowLeft, Loader2, Camera, Sparkles, AlertCircle } from "lucide-react";

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { t } = useTranslation();

  const onboardingSchema = z.object({
    username: z.string().min(3, t('auth.validation.username_min')).max(30).regex(/^[a-zA-Z0-9_]+$/, t('auth.validation.username_format')),
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
    dateOfBirth: z.string().optional(),
    city: z.string().max(50).optional(),
    country: z.string().max(50).optional(),
    bio: z.string().max(500).optional(),
  });

  type OnboardingForm = z.infer<typeof onboardingSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting }, trigger } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: user?.username || "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      city: "",
      country: "",
      bio: "",
    }
  });

  const totalSteps = 3;

  const steps = [
    { title: t('auth.onboarding.step1_title'), subtitle: t('auth.onboarding.step1_subtitle') },
    { title: t('auth.onboarding.step2_title'), subtitle: t('auth.onboarding.step2_subtitle') },
    { title: t('auth.onboarding.step3_title'), subtitle: t('auth.onboarding.step3_subtitle') },
  ];

  const handleNext = async () => {
    if (step === 0) {
      const valid = await trigger('username');
      if (!valid) return;
    }
    if (step === 1) {
      const valid = await trigger(['firstName', 'lastName', 'dateOfBirth', 'city', 'country']);
      if (!valid) return;
    }
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const onSubmit = async (data: OnboardingForm) => {
    setError(null);
    try {
      let finalAvatarUrl = undefined;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await apiClient.post("/api/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        finalAvatarUrl = uploadRes.data.url;
      }

      const submitData = { ...data, avatarUrl: finalAvatarUrl };
      await apiClient.post("/api/users/onboarding", submitData);
      
      updateUser({ 
        username: data.username, 
        isProfileCompleted: true 
      });
      
      toast.success(t('auth.onboarding.success_title'), {
        description: t('auth.onboarding.success_desc'),
        action: {
          label: t('auth.onboarding.success_action'),
          onClick: () => navigate(`/users/${data.username}`)
        },
        duration: 8000
      });
      
      navigate("/feed");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(" ");
        setError(validationErrors);
      } else {
        setError(err.response?.data?.message || t('auth.onboarding.error_failed'));
      }
    }
  };

  const InputField = ({ name, label, placeholder, type = "text", optional = false, icon: Icon }: {
    name: keyof OnboardingForm; label: string; placeholder: string; type?: string; optional?: boolean; icon?: any;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
        {label}
        {optional && <span className="text-xs text-muted-foreground font-normal">({t('auth.onboarding.optional')})</span>}
      </label>
      <div className={`relative transition-all duration-300 ${focusedField === name ? 'scale-[1.01]' : ''}`}>
        {Icon && (
          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
            focusedField === name ? 'text-primary' : 'text-muted-foreground/50'
          }`} />
        )}
        <input
          type={type}
          placeholder={placeholder}
          {...register(name)}
          onFocus={() => setFocusedField(name)}
          onBlur={() => setFocusedField(null)}
          className={`w-full h-12 ${Icon ? 'pl-11' : 'pl-4'} pr-4 rounded-xl border bg-background text-sm transition-all duration-200 outline-none
            ${errors[name]
              ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
              : 'border-input hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
        />
      </div>
      {errors[name] && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />{errors[name]?.message}
        </motion.p>
      )}
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-8 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="w-full max-w-lg relative z-10">
        {/* Progress Bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              {t('auth.onboarding.step', { current: step + 1, total: totalSteps })}
            </span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Step Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-extrabold tracking-tight">{steps[step].title}</h1>
            <p className="text-muted-foreground mt-1">{steps[step].subtitle}</p>
          </motion.div>
        </AnimatePresence>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (step < totalSteps - 1) {
            handleNext();
          } else {
            handleSubmit(onSubmit)(e);
          }
        }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Username */}
            {step === 0 && (
              <motion.div key="step-0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-5">
                <InputField name="username" label={t('auth.onboarding.username')} placeholder={t('auth.onboarding.username_placeholder')} icon={UserCircle} />
                <p className="text-xs text-muted-foreground">{t('auth.onboarding.username_hint')}</p>
              </motion.div>
            )}

            {/* Step 2: Personal Info */}
            {step === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <InputField name="firstName" label={t('auth.onboarding.first_name')} placeholder={t('auth.onboarding.first_name_placeholder')} optional />
                  <InputField name="lastName" label={t('auth.onboarding.last_name')} placeholder={t('auth.onboarding.last_name_placeholder')} optional />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField name="country" label={t('auth.onboarding.country')} placeholder={t('auth.onboarding.country_placeholder')} optional />
                  <InputField name="city" label={t('auth.onboarding.city')} placeholder={t('auth.onboarding.city_placeholder')} optional />
                </div>
                <InputField name="dateOfBirth" label={t('auth.onboarding.date_of_birth')} placeholder="" type="date" optional />
              </motion.div>
            )}

            {/* Step 3: Avatar & Bio */}
            {step === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-28 h-28 rounded-full border-4 border-primary/20 flex items-center justify-center overflow-hidden bg-muted group cursor-pointer shadow-lg"
                  >
                    {selectedFile ? (
                      <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-16 h-16 text-primary/40" />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Camera className="h-6 w-6 text-white mb-1" />
                      <span className="text-white text-xs font-bold">
                        {selectedFile ? t('auth.onboarding.avatar_change') : t('auth.onboarding.avatar_upload')}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </motion.div>
                  <span className="text-xs text-muted-foreground mt-2">({t('auth.onboarding.optional')})</span>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                    {t('auth.onboarding.bio')}
                    <span className="text-xs text-muted-foreground font-normal">({t('auth.onboarding.optional')})</span>
                  </label>
                  <textarea
                    placeholder={t('auth.onboarding.bio_placeholder')}
                    {...register("bio")}
                    className="w-full min-h-[120px] px-4 py-3 rounded-xl border bg-background text-sm transition-all duration-200 outline-none resize-none border-input hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="mt-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
                <Button type="button" variant="outline" onClick={handleBack} className="w-full h-12 rounded-xl text-base font-semibold">
                  <ArrowLeft className="mr-2 h-4 w-4" />{t('auth.onboarding.back')}
                </Button>
              </motion.div>
            )}
            <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
              {step < totalSteps - 1 ? (
                <Button type="button" onClick={handleNext} className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 group">
                  {t('auth.onboarding.next')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit(onSubmit)} className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 group" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      {t('auth.onboarding.submit')}
                      <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
