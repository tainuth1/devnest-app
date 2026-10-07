"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Input, Button } from "@/shared/components/ui";
import { useAuth, HoneypotTrap } from "@/features/authentication";
import { ApiError } from "@/shared/types";

// Validation schema matching backend OWASP requirements
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    website: z.string().optional(),
    phone_confirm: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    resetPassword,
    pendingResetEmail,
    pendingResetOtp,
    isResetOtpVerified,
  } = useAuth();

  const emailParam = searchParams.get("email");
  const targetEmail = pendingResetEmail || emailParam;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    website: "",
    phone_confirm: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>> & {
      general?: string;
    }
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // Prerequisite check: Must have completed OTP verification step
  useEffect(() => {
    // If successfully submitted, do not trigger fallback redirection
    if (isSubmitted) return;

    if (!targetEmail || !isResetOtpVerified) {
      router.replace(
        targetEmail
          ? "/auth/verify-forgot-password-otp"
          : "/auth/forgot-password"
      );
    }
  }, [targetEmail, isResetOtpVerified, isSubmitted, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!targetEmail) {
      setErrors({ general: "Missing email address. Please start over." });
      return;
    }

    try {
      resetPasswordSchema.parse(formData);
      setIsLoading(true);
      setIsSubmitted(true);

      await resetPassword({
        email: targetEmail,
        otp_code: pendingResetOtp || "",
        new_password: formData.password,
        website: formData.website,
        phone_confirm: formData.phone_confirm,
      });

      // Immediately replace route with login page and reset confirmation
      router.replace("/auth/login?reset=true");
    } catch (error) {
      setIsSubmitted(false);
      setIsLoading(false);
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<
          Record<keyof ResetPasswordFormData, string>
        > = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof ResetPasswordFormData] =
              issue.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Failed to reset password. Please try again." });
      }
    }
  };

  if ((!targetEmail || !isResetOtpVerified) && !isSubmitted) {
    return (
      <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
        <p className="text-description text-sm">
          Redirecting to verification step...
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-heading mb-2 text-3xl font-bold">
            Set New Password
          </h2>
          <p className="text-description text-sm">
            Please enter your new password to secure your account.
          </p>
        </div>

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

          {/* New Password Field */}
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            label="New password"
            placeholder="Min 8 chars (upper, lower, digit, symbol)"
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

          {/* Confirm Password Field */}
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            label="Confirm new password"
            placeholder="••••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            disabled={isLoading}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted hover:text-heading cursor-pointer"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />

          {/* Submit Button */}
          <Button type="submit" fullWidth isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
          <div className="text-description text-sm">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
