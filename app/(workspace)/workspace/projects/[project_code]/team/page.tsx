"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  Shield,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/shared/components/ui";

const TeamPage = () => {
  const params = useParams();
  const projectCode = (params?.project_code as string) || "proj_1";

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-3rem)] bg-zinc-50/50">
      {/* Top Action Bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">
                Team & Collaborators
              </h1>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.2 text-[10px] font-semibold text-blue-700">
                RBAC Scopes
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Manage project members, invite collaborators and assign permission scopes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" leftIcon={<UserPlus className="h-3.5 w-3.5" />}>
            Invite Member
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">
              Active Project Members
            </h3>
            <span className="text-xs text-zinc-500">1 member</span>
          </div>

          <div className="divide-y divide-zinc-100">
            <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold">
                  TN
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900">Tai Nuth</span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.2 text-[10px] font-medium text-emerald-700">
                      You
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">tainuth@example.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                  OWNER
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
