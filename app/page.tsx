"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Shield, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useAuth } from "@/features/authentication";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/workspace");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="text-body flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-border border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl font-bold shadow-xs">
              DN
            </div>
            <span className="text-heading text-xl font-bold tracking-tight">
              DevNest
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="border-primary/20 bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold shadow-2xs">
            <Sparkles size={14} />
            <span>Fully Integrated Authentication System</span>
          </div>

          <h1 className="text-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Developer tools built with{" "}
            <span className="from-primary bg-linear-to-r to-emerald-700 bg-clip-text text-transparent">
              complete security
            </span>
          </h1>

          <p className="text-description mt-6 text-lg">
            Cookie-based session management, Next.js 16 Proxy route protection,
            multi-step verification flows, and role-based access control.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>
                Create an Account
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Lock size={16} />}
              >
                Sign in to Workspace
              </Button>
            </Link>
          </div>

          {/* Highlights */}
          <div className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
            <div className="border-border hover:border-border-hover rounded-xl border bg-white p-5 shadow-2xs transition-colors">
              <div className="text-primary mb-2">
                <Shield size={24} />
              </div>
              <h3 className="text-heading font-semibold">Protected Routes</h3>
              <p className="text-description mt-1 text-xs">
                Every request intercepted by proxy.ts middleware before
                rendering.
              </p>
            </div>
            <div className="border-border hover:border-border-hover rounded-xl border bg-white p-5 shadow-2xs transition-colors">
              <div className="text-primary mb-2">
                <Lock size={24} />
              </div>
              <h3 className="text-heading font-semibold">Step Enforcement</h3>
              <p className="text-description mt-1 text-xs">
                Multi-step OTP verification and password reset sequences
                strictly guarded.
              </p>
            </div>
            <div className="border-border hover:border-border-hover rounded-xl border bg-white p-5 shadow-2xs transition-colors">
              <div className="text-primary mb-2">
                <Sparkles size={24} />
              </div>
              <h3 className="text-heading font-semibold">Session Cookies</h3>
              <p className="text-description mt-1 text-xs">
                HttpOnly, SameSite cookie sessions with Remember Me support.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
