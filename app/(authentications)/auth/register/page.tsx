"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { z } from "zod";
import { Input, Button } from "@/shared/components/ui";
import { useAuth, HoneypotTrap } from "@/features/authentication";
import { ApiError } from "@/shared/types";

// Validation schema matching backend OWASP requirements
const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username may only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Please enter a valid email address"),
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
  website: z.string().optional(),
  phone_confirm: z.string().optional(),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    website: "",
    phone_confirm: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>> & { general?: string }
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
      signUpSchema.parse(formData);
      setIsLoading(true);

      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        website: formData.website,
        phone_confirm: formData.phone_confirm,
      });

      // Route to step 2 (verify OTP)
      router.push(
        `/auth/verify?email=${encodeURIComponent(formData.email.trim())}`
      );
    } catch (error) {
      setIsLoading(false);
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof SignUpFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof SignUpFormData] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Failed to create account. Please try again." });
      }
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-heading mb-2 text-3xl font-bold">
            Create an Account
          </h2>
          <p className="text-description text-sm">
            Please fill in your details to create your account.
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

          {/* Username Field */}
          <Input
            type="text"
            name="username"
            label="Username"
            placeholder="eg. johndoe"
            value={formData.username}
            onChange={handleInputChange}
            error={errors.username}
            disabled={isLoading}
          />

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

          {/* Password Field */}
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            label="Password"
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

          {/* Submit Button */}
          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Account
          </Button>

          {/* Sign In Link */}
          <p className="text-body mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:opacity-90"
            >
              Log in
            </Link>
          </p>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="border-border flex-1 border-t"></div>
            <span className="text-description text-sm">Or</span>
            <div className="border-border flex-1 border-t"></div>
          </div>

          {/* Social Sign Up Buttons */}
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
