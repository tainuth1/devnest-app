"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  LogOut,
  Clock,
  Mail,
  CheckCircle,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useAuth } from "@/features/authentication";

export default function WorkspacePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/workspace");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-description text-sm font-medium">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin =
    user.role.toLowerCase() === "admin" ||
    user.role.toLowerCase() === "superadmin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="border-border border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm">
              DN
            </div>
            <div>
              <h1 className="text-heading text-lg font-bold">
                DevNest Workspace
              </h1>
              <p className="text-description text-xs">
                Authenticated Developer Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink size={14} />}
                >
                  Admin Panel
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              leftIcon={<LogOut size={16} />}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl bg-linear-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <CheckCircle size={14} />
                Session Active
              </div>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Welcome back, {user.first_name || user.username || user.email}!
              </h2>
              <p className="mt-1 text-sm text-emerald-100">
                You are securely logged into DevNest. All routes and services
                are operational.
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Profile Card */}
          <div className="border-border rounded-xl border bg-white p-6 shadow-xs">
            <div className="border-border-subtle flex items-center gap-3 border-b pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-heading font-semibold">User Profile</h3>
                <p className="text-description text-xs">Identity details</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-description">Username</span>
                <span className="text-heading font-medium">
                  {user.username || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-description">Email</span>
                <span className="text-heading flex items-center gap-1 font-medium">
                  <Mail size={13} className="text-muted" />
                  {user.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-description">Role</span>
                <span className="text-body inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-description">Status</span>
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 capitalize">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Session Security Card */}
          <div className="border-border rounded-xl border bg-white p-6 shadow-xs">
            <div className="border-border-subtle flex items-center gap-3 border-b pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-heading font-semibold">
                  Security & Session
                </h3>
                <p className="text-description text-xs">
                  Cookie and session protection
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-description">Session Cookie</span>
                <span className="font-medium text-emerald-600">
                  HttpOnly Secure
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-description">Route Middleware</span>
                <span className="font-medium text-emerald-600">
                  Active (proxy.ts)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-description">Last Login</span>
                <span className="text-heading flex items-center gap-1 text-xs font-medium">
                  <Clock size={13} className="text-muted" />
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString()
                    : "First session"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="border-border rounded-xl border bg-white p-6 shadow-xs">
            <div className="border-border-subtle flex items-center gap-3 border-b pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Laptop size={24} />
              </div>
              <div>
                <h3 className="text-heading font-semibold">
                  Developer Actions
                </h3>
                <p className="text-description text-xs">Platform tools</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Link href="/auth/forgot-password" className="block">
                <Button variant="outline" fullWidth size="sm">
                  Test Password Reset Flow
                </Button>
              </Link>
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => logout()}
                className="text-red-600 hover:text-red-700"
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
