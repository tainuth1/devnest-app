"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  History,
  GitCommitHorizontal,
  RotateCcw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/components/ui";

const VersionHistoryPage = () => {
  const params = useParams();
  const projectCode = (params?.project_code as string) || "proj_1";

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-3rem)] bg-zinc-50/50">
      {/* Top Action Bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <History className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">
                Universal Version History
              </h1>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.2 text-[10px] font-semibold text-amber-700">
                Artifact Timeline
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Point-in-time snapshots, diff inspections and safe rollbacks across diagrams, schemas & documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" leftIcon={<GitCommitHorizontal className="h-3.5 w-3.5" />}>
            Create Snapshot Checkpoint
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl rounded-2xl border-2 border-dashed border-zinc-200 bg-white/70 p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Clock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-900">
            No Historical Snapshots Created Yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
            Version history preserves immutable snapshots of diagrams, database tables, and markdown specifications so you can review diffs and rollback anytime.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="sm" leftIcon={<GitCommitHorizontal className="h-3.5 w-3.5" />}>
              Create First Checkpoint
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryPage;
