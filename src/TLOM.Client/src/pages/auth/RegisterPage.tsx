import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { apiClient } from "@/shared/api/apiClient";
import { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from './AuthLayout';
import { Loader2, Mail, Lock, ArrowRight, AlertCircle, MailCheck, Eye, EyeOff, Sparkles } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const { t } = useTranslation();

  const registerSchema = z.object({
    email: z.string().email(t('auth.validation.email_invalid')),
    password: z.string().min(6, t('auth.validation.password_min')),
  });

  type RegisterForm = z.infer<typeof registerSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      const res = await apiClient.post("/api/auth/register", data);
      if (res.data?.requiresEmailConfirmation) {
        setSuccessMessage(res.data.message || "Registration successful. Please check your email to confirm your account.");
      } else {
        setSuccessMessage(res.data.message || "Registration successful! You can now sign in.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || t('auth.register.error_failed'));
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    try {
      const response = await apiClient.post("/api/auth/google", {
        idToken: credentialResponse.credential
      });
      const resData = response.data;
      const user = {
        id: resData.accountId,
        userProfileId: resData.userProfileId,
        email: resData.email,
        username: resData.username,
        role: resData.role,
        isProfileCompleted: resData.isProfileCompleted
      };
      setAuth(resData.accessToken, resData.refreshToken, user);
      if (!user.isProfileCompleted) {
        navigate("/onboarding");
      } else {
        navigate("/feed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.register.error_google'));
    }
  };

  // ═══ Success State ═══
  if (successMessage) {
    return (
      <AuthLayout mode="register">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-8 py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="relative"
          >
            <div className="mx-auto w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center relative">
              <MailCheck className="h-12 w-12 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                <Sparkles className="h-3 w-3 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-3"
          >
            <h2 className="text-3xl font-extrabold font-display">{t('auth.register.success_title')}</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">{successMessage}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button asChild className="w-full h-13 rounded-xl text-base font-bold shadow-lg shadow-primary/25 group relative overflow-hidden">
              <Link to="/login">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  {t('auth.register.success_go_login')}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout mode="register">
      <div className="space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="inline-flex items-center gap-2 bg-primary/10 rounded-2xl px-5 py-2.5"
            >
              <span className="text-xl font-bold font-display text-gradient">Time Line Of Me</span>
            </motion.div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display">{t('auth.register.title')}</h1>
          <p className="text-muted-foreground text-base">{t('auth.register.subtitle')}</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 tracking-wide">{t('auth.register.email')}</label>
            <div className={`relative group transition-all duration-400 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 ${
                focusedField === 'email' ? 'text-primary scale-110' : 'text-muted-foreground/40'
              }`} />
              <input
                type="email"
                placeholder={t('auth.register.email_placeholder')}
                {...register("email")}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full h-13 pl-12 pr-4 rounded-xl border bg-card/50 text-sm font-medium transition-all duration-300 outline-none placeholder:text-muted-foreground/40
                  ${errors.email
                    ? 'border-destructive focus:ring-2 focus:ring-destructive/20 focus:shadow-lg focus:shadow-destructive/10'
                    : 'border-border/60 hover:border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 focus:shadow-lg focus:shadow-primary/5'
                  }`}
              />
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                className="text-xs text-destructive flex items-center gap-1.5 font-medium"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </motion.p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 tracking-wide">{t('auth.register.password')}</label>
            <div className={`relative group transition-all duration-400 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 ${
                focusedField === 'password' ? 'text-primary scale-110' : 'text-muted-foreground/40'
              }`} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t('auth.register.password_placeholder')}
                {...register("password")}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full h-13 pl-12 pr-12 rounded-xl border bg-card/50 text-sm font-medium transition-all duration-300 outline-none placeholder:text-muted-foreground/40
                  ${errors.password
                    ? 'border-destructive focus:ring-2 focus:ring-destructive/20 focus:shadow-lg focus:shadow-destructive/10'
                    : 'border-border/60 hover:border-primary/30 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 focus:shadow-lg focus:shadow-primary/5'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground/60 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                className="text-xs text-destructive flex items-center gap-1.5 font-medium"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2.5 shadow-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.div whileTap={{ scale: 0.97 }} className="pt-1">
            <Button
              type="submit"
              className="w-full h-13 rounded-xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-400 group relative overflow-hidden"
              disabled={isSubmitting}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t('auth.register.submit')}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </>
                )}
              </span>
            </Button>
          </motion.div>
        </motion.form>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-5 text-muted-foreground/50 font-semibold tracking-[0.15em]">
              {t('auth.register.or_continue')}
            </span>
          </div>
        </motion.div>

        {/* Google Login */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center"
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t('auth.register.error_google'))}
            useOneTap
            theme="outline"
            text="continue_with"
            shape="pill"
            width="380"
          />
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-sm text-muted-foreground"
        >
          {t('auth.register.has_account')}{' '}
          <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary/60">
            {t('auth.register.sign_in_link')}
          </Link>
        </motion.p>
      </div>
    </AuthLayout>
  );
}
