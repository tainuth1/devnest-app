"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  HardDriveDownload,
  Plus,
  ShieldCheck,
  RotateCcw,
  Download,
  Archive,
} from "lucide-react";
import { Button } from "@/shared/components/ui";

const BackupsPage = () => {
  const params = useParams();
  const projectCode = (params?.project_code as string) || "proj_1";

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-1 flex-col bg-zinc-50/50">
      {/* Top Action Bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <HardDriveDownload className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">
                Backups & Disaster Recovery
              </h1>
              <span className="py-0.2 rounded-full border border-teal-200 bg-teal-50 px-2 text-[10px] font-semibold text-teal-700">
                AES-256 Encrypted
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Automated daily snapshots, encrypted archives, and atomic disaster
              restoration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Create Manual Backup
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl rounded-2xl border-2 border-dashed border-zinc-200 bg-white/70 p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-900">
            Automated Daily Backups Active
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
            Dev Nest snapshots your complete project every 24 hours with SHA-256
            integrity verification. Pre-restore safeguards ensure zero
            irreversible data loss.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Trigger Backup Snapshot
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="h-3.5 w-3.5 text-zinc-500" />}
            >
              Restore from Archive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupsPage;
