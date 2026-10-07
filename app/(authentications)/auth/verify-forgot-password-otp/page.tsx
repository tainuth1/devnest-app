"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OtpInput, Button } from "@/shared/components/ui";
import { useAuth, HoneypotTrap } from "@/features/authentication";
import { ApiError } from "@/shared/types";

function VerifyForgotPasswordOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    verifyResetOtp,
    forgotPassword,
    pendingResetEmail,
    setPendingResetEmail,
  } = useAuth();

  const emailParam = searchParams.get("email");
  const targetEmail = pendingResetEmail || emailParam;

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [honeypot, setHoneypot] = useState({
    website: "",
    phone_confirm: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const canResend = resendCountdown === 0;

  const handleHoneypotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHoneypot((prev) => ({ ...prev, [name]: value }));
  };

  // Prerequisite step protection
  useEffect(() => {
    if (!targetEmail) {
      router.replace("/auth/forgot-password");
    } else if (emailParam && !pendingResetEmail) {
      setPendingResetEmail(emailParam);
    }
  }, [
    targetEmail,
    emailParam,
    pendingResetEmail,
    setPendingResetEmail,
    router,
  ]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleOtpChange = (newOtp: string[]) => {
    setOtp(newOtp);
    if (error) setError("");
  };

  const handleResend = async () => {
    if (!canResend || !targetEmail) return;
    try {
      await forgotPassword({ email: targetEmail });
      setResendCountdown(30);
      setOtp(Array(6).fill(""));
      setError("");
    } catch {
      setError("Failed to resend reset code. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length < 6) {
      setError("Please enter all 6 digits of the OTP code");
      return;
    }

    if (!targetEmail) {
      setError("Missing email address. Please start password reset again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await verifyResetOtp({
        email: targetEmail,
        otp_code: fullOtp,
        website: honeypot.website,
        phone_confirm: honeypot.phone_confirm,
      });

      // Immediately redirect to reset password step
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(targetEmail)}`
      );
    } catch (err) {
      setIsLoading(false);
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to verify OTP code. Please try again.");
      }
    }
  };

  if (!targetEmail) {
    return (
      <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
        <p className="text-description text-sm">
          Redirecting to password recovery...
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-heading mb-2 text-3xl font-bold">
            Verify Reset Code
          </h2>
          <p className="text-description text-sm">
            We sent a 6-digit verification code to{" "}
            <span className="text-heading font-semibold">{targetEmail}</span>.
            Enter it below to continue.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Honeypot Bot Trap */}
          <HoneypotTrap
            website={honeypot.website}
            phoneConfirm={honeypot.phone_confirm}
            onChange={handleHoneypotChange}
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 6 Square OTP Inputs */}
          <div>
            <OtpInput
              length={6}
              value={otp}
              onChange={handleOtpChange}
              error={error}
              disabled={isLoading}
            />
          </div>

          {/* Resend Code Section */}
          <div className="text-description text-center text-sm">
            Didn&apos;t receive the code?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary cursor-pointer font-semibold hover:opacity-90"
              >
                Resend code
              </button>
            ) : (
              <span className="text-muted">
                Resend code in {resendCountdown}s
              </span>
            )}
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={otp.join("").length < 6}
          >
            Verify Code
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

export default function VerifyForgotPasswordOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full items-center justify-center p-5 md:w-1/2 md:p-0">
          <div className="text-description text-sm">Loading...</div>
        </div>
      }
    >
      <VerifyForgotPasswordOtpContent />
    </Suspense>
  );
}
