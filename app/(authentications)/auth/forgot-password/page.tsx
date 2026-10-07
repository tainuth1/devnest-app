"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Input, Button } from "@/shared/components/ui";
import { useAuth, HoneypotTrap } from "@/features/authentication";
import { ApiError } from "@/shared/types";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  website: z.string().optional(),
  phone_confirm: z.string().optional(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
    website: "",
    phone_confirm: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormData, string>> & {
      general?: string;
    }
  >({});
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      forgotPasswordSchema.parse(formData);
      setIsLoading(true);

      await forgotPassword({
        email: formData.email.trim(),
        website: formData.website,
        phone_confirm: formData.phone_confirm,
      });

      // Immediately redirect to the next step
      router.push(
        `/auth/verify-forgot-password-otp?email=${encodeURIComponent(
          formData.email.trim()
        )}`
      );
    } catch (error) {
      setIsLoading(false);
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<
          Record<keyof ForgotPasswordFormData, string>
        > = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof ForgotPasswordFormData] =
              issue.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({
          general: "Failed to request password reset. Please try again.",
        });
      }
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-heading mb-2 text-3xl font-bold">
            Forgot Password?
          </h2>
          <p className="text-description text-sm">
            Enter your email address and we&apos;ll send you an OTP code to
            reset your password.
          </p>
        </div>

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

          {/* Email Field */}
          <Input
            type="email"
            name="email"
            label="Email address"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            disabled={isLoading}
          />

          {/* Submit Button */}
          <Button type="submit" fullWidth isLoading={isLoading}>
            Send Reset Code
          </Button>

          {/* Back to Login Link */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-description hover:text-heading inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
