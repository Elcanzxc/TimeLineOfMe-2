import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/Card";
import { apiClient } from "@/shared/api/apiClient";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const response = await apiClient.post("/api/auth/login", data);
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
      setError(err.response?.data?.message || "Invalid email or password");
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
      setError(err.response?.data?.message || "Google authentication failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Enter your email and password to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
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
              {isSubmitting ? "Logging in..." : "Login"}
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
              onError={() => setError('Google login failed.')}
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
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
