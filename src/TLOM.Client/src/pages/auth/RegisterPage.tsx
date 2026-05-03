import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/Card";
import { apiClient } from "@/shared/api/apiClient";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const setAuth = useAuthStore((state) => state.setAuth);

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      const res = await apiClient.post("/api/auth/register", data);
      if (res.data?.requiresEmailConfirmation) {
        setSuccessMessage(res.data.message || "Registration successful. Please check your email to confirm your account.");
      } else {
        navigate("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
        email: resData.email,
        username: resData.username,
        role: resData.role,
        isProfileCompleted: resData.isProfileCompleted
      };
      setAuth(resData.accessToken, resData.refreshToken, user);
      if (!user.isProfileCompleted) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Google registration failed");
    }
  };

  if (successMessage) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-muted/30 px-4 py-12">
        <Card className="w-full max-w-md text-center py-6">
          <CardContent className="flex flex-col items-center space-y-4">
            <MailCheck className="h-16 w-16 text-primary" />
            <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
            <p className="text-muted-foreground">{successMessage}</p>
            <Button asChild className="mt-4 w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                placeholder="johndoe"
                {...register("username")}
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center mt-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google registration failed.')}
              useOneTap
              theme="outline"
              text="continue_with"
              shape="rectangular"
              width="350"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col border-t p-6 pb-6 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
