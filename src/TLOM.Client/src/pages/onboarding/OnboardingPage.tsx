import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { apiClient } from "@/shared/api/apiClient";
import { UserCircle } from "lucide-react";

const onboardingSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  firstName: z.string().max(50, "First name must be less than 50 characters").optional(),
  lastName: z.string().max(50, "Last name must be less than 50 characters").optional(),
  dateOfBirth: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: user?.username || "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      bio: "",
    }
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      await apiClient.post("/api/users/me/onboarding", submitData);
      
      updateUser({ 
        username: data.username, 
        isProfileCompleted: true 
      });
      
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Handle FluentValidation errors
        const validationErrors = Object.values(err.response.data.errors).flat().join(" ");
        setError(validationErrors);
      } else {
        setError(err.response?.data?.message || "Failed to complete onboarding.");
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center overflow-hidden bg-muted relative group">
            {selectedFile ? (
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-16 h-16 text-primary" />
            )}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-white text-xs font-bold">Upload</span>
              <Input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Complete your profile</CardTitle>
          <CardDescription>
            Just a few details before you can start building your timeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                placeholder="cinephile_alex"
                {...register("username")}
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              <p className="text-xs text-muted-foreground">
                This will be your unique handle (e.g. @cinephile_alex)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name (Optional)</label>
                <Input
                  placeholder="Alex"
                  {...register("firstName")}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name (Optional)</label>
                <Input
                  placeholder="Smith"
                  {...register("lastName")}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth (Optional)</label>
              <Input
                type="date"
                {...register("dateOfBirth")}
                className={errors.dateOfBirth ? "border-destructive" : ""}
              />
              {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio (Optional)</label>
              <Textarea
                placeholder="Tell us a bit about yourself and your taste in media..."
                className={`resize-none h-24 ${errors.bio ? "border-destructive" : ""}`}
                {...register("bio")}
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Start my journey"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
