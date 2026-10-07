"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { z } from "zod";
import { Input, Button, Checkbox } from "@/shared/components/ui";
import { useAuth, HoneypotTrap } from "@/features/authentication";
import { ApiError } from "@/shared/types";

const signInSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
  website: z.string().optional(),
  phone_confirm: z.string().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/workspace";
  const wasReset = searchParams.get("reset") === "true";

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    website: "",
    phone_confirm: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignInFormData, string>> & { general?: string }
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof errors];
        return newErrors;
      });
    }

    if (errors.general) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    try {
      signInSchema.parse(formData);
      setIsLoading(true);

      await login({
        login_id: formData.email.trim(),
        password: formData.password,
        remember_me: formData.rememberMe,
        website: formData.website,
        phone_confirm: formData.phone_confirm,
      });

      router.push(redirectPath);
    } catch (error) {
      setIsLoading(false);
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof SignInFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof SignInFormData] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "An unexpected error occurred during login." });
      }
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-heading mb-2 text-3xl font-bold">Welcome Back</h2>
          <p className="text-description text-sm">
            Please log in to your account to continue.
          </p>
        </div>

        {/* Success banners from previous step completions */}
        {wasReset && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>Password reset successfully!</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Honeypot Bot Trap */}
          <HoneypotTrap
            website={formData.website}
            phoneConfirm={formData.phone_confirm}
            onChange={handleInputChange}
          />

          {/* General Error Message */}
          {errors.general && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Email or Username Field */}
          <Input
            type="text"
            name="email"
            label="Email or Username"
            placeholder="example@gmail.com or username"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            disabled={isLoading}
          />

          {/* Password Field */}
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            label="Password"
            labelRight={
              <Link
                href="/auth/forgot-password"
                className="text-primary hover:opacity-90"
              >
                Forgot Password?
              </Link>
            }
            placeholder="••••••••••"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            disabled={isLoading}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted hover:text-heading cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <Checkbox
              name="rememberMe"
              label="Remember me"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" fullWidth isLoading={isLoading}>
            Log in
          </Button>

          {/* Sign Up Link */}
          <p className="text-body mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary font-semibold hover:opacity-90"
            >
              Register
            </Link>
          </p>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="border-border flex-1 border-t"></div>
            <span className="text-description text-sm">Or</span>
            <div className="border-border flex-1 border-t"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              leftIcon={
                <Image
                  src="/icons/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
              }
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              leftIcon={
                <Image
                  src="/icons/github.svg"
                  alt="Github"
                  width={20}
                  height={20}
                />
              }
            >
              Github
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
          <div className="text-description text-sm">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
