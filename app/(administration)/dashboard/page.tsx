"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useAuth } from "@/features/authentication";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "superadmin";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-description text-sm font-medium">
            Verifying authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-heading text-xl font-bold">Access Restricted</h2>
          <p className="text-description mt-2 text-sm">
            You are logged in as{" "}
            <span className="text-heading font-semibold">{user.email}</span>{" "}
            with role{" "}
            <span className="text-primary font-semibold uppercase">
              {user.role}
            </span>
            . This area requires administrative privileges.
          </p>
          <div className="mt-6">
            <Link href="/workspace">
              <Button fullWidth leftIcon={<ArrowLeft size={16} />}>
                Return to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-border border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm">
              AD
            </div>
            <div>
              <h1 className="text-heading text-lg font-bold">
                Administration Console
              </h1>
              <p className="text-description text-xs">
                Privileged Operations Area
              </p>
            </div>
          </div>

          <Link href="/workspace">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
            >
              Back to Workspace
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-border rounded-2xl border bg-white p-6 shadow-xs">
          <div className="border-border-subtle flex items-center gap-3 border-b pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-heading text-xl font-bold">
                Admin Control Center
              </h2>
              <p className="text-description text-sm">
                Logged in as Super/Admin: {user.email}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-border-subtle rounded-xl border bg-zinc-50 p-4">
              <div className="text-body flex items-center gap-2 text-sm font-semibold">
                <Users size={18} className="text-emerald-600" />
                User Management
              </div>
              <p className="text-description mt-2 text-xs">
                RBAC permissions and user status operations active.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
