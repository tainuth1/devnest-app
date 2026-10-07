"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Workflow,
  Database,
  FileText,
  HardDriveDownload,
  Copy,
  Check,
  Layers,
  GripHorizontal,
  Plus,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { toast } from "@/shared/components/ui";
import {
  ProjectStatus,
  PROJECT_STATUS_CONFIG,
  ProjectOverviewData,
  ProjectCanvas,
} from "@/features/project";
import { ProjectsService } from "@/features/project/services/project.service";

const MEMBER_PALETTE = [
  "bg-emerald-600",
  "bg-sky-600",
  "bg-indigo-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-purple-600",
  "bg-teal-600",
];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Just now";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Skeleton Loader matching exact dimensions and layout design of the Project Overview page.
 */
const ProjectOverviewSkeleton = () => {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex-1 bg-white p-8 lg:p-12">
      <div className="mx-auto flex h-full max-w-375 flex-col items-center gap-10 lg:flex-row xl:gap-14">
        {/* Left Column Skeleton */}
        <div className="w-full shrink-0 space-y-6 lg:w-120 xl:w-130">
          {/* Header Title & Code */}
          <div className="space-y-2.5">
            <div className="h-8 w-64 animate-pulse rounded-md bg-zinc-200 xl:h-9" />
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-20 animate-pulse rounded bg-zinc-100" />
              <div className="h-3.5 w-44 animate-pulse rounded bg-zinc-200" />
              <div className="h-5.5 w-14 animate-pulse rounded-md border border-zinc-100 bg-zinc-50" />
            </div>
          </div>

          {/* 6 Frameless Metric Items */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl border border-zinc-100 bg-zinc-50 shadow-2xs" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>

          {/* Members, Pending Invites, and Timestamps Section */}
          <div className="space-y-5 border-t border-zinc-100 pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-200" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 animate-pulse rounded-full border border-white bg-zinc-200" />
                  <div className="h-8 w-8 animate-pulse rounded-full border border-white bg-zinc-200" />
                  <div className="h-8 w-8 animate-pulse rounded-full border border-white bg-zinc-200" />
                </div>
                <div className="h-8 w-8 animate-pulse rounded-full border border-dashed border-zinc-200 bg-zinc-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 pt-1">
              <div className="space-y-1.5">
                <div className="h-2.5 w-20 animate-pulse rounded bg-zinc-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-24 animate-pulse rounded bg-zinc-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Canvas Skeleton */}
        <div className="border-border relative flex min-h-120 w-full flex-1 flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-2xs lg:min-h-145 xl:min-h-160">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #e4e4e7 1.25px, transparent 1.25px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10 flex justify-end p-4">
            <div className="border-border flex items-center gap-1 rounded-lg border bg-white/90 p-1 shadow-2xs backdrop-blur-xs">
              <div className="h-7 w-7 animate-pulse rounded-md bg-zinc-100" />
              <div className="h-7 w-7 animate-pulse rounded-md bg-zinc-100" />
              <div className="h-7 w-7 animate-pulse rounded-md bg-zinc-100" />
            </div>
          </div>
          <div className="relative z-0 flex flex-1 items-center justify-center p-8">
            <div className="h-20 w-44 animate-pulse rounded-xl border border-dashed border-zinc-200 bg-zinc-50/40" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Error / Not Found state component.
 */
const ProjectErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-1 items-center justify-center bg-white p-8 lg:p-12">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-200 p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900">
            Project Not Found
          </h2>
          <p className="text-xs leading-relaxed text-zinc-500">{error}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/workspace/projects"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Projects</span>
          </Link>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectDetailPage = () => {
  const params = useParams();
  const projectCodeParam = (params?.project_code as string) || "";

  const [copiedCode, setCopiedCode] = useState(false);
  const [projectData, setProjectData] = useState<ProjectOverviewData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(() => {
    if (!projectCodeParam) {
      setError("No project code specified");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    ProjectsService.getProjectByCode(projectCodeParam)
      .then((data) => {
        setProjectData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to retrieve project details"
        );
        setIsLoading(false);
      });
  }, [projectCodeParam]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProject();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProject]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(`Copied project code "${code}"`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return <ProjectOverviewSkeleton />;
  }

  if (error || !projectData) {
    return (
      <ProjectErrorState
        error={error || `Project "${projectCodeParam}" could not be loaded.`}
        onRetry={fetchProject}
      />
    );
  }

  const project = {
    ...projectData,
    formatted_created_at: formatDate(projectData.created_at),
    formatted_updated_at: formatDate(projectData.updated_at),
    members: (projectData.members || []).map((m, idx) => ({
      ...m,
      bg: m.bg || MEMBER_PALETTE[idx % MEMBER_PALETTE.length],
    })),
  };

  const statusConfig = PROJECT_STATUS_CONFIG[project.status] || {
    dotColor: "bg-emerald-500 ring-2 ring-emerald-500/20",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    border: "border-emerald-200",
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex-1 bg-white p-8 lg:p-12">
      <div className="mx-auto flex h-full max-w-375 flex-col items-center gap-10 lg:flex-row xl:gap-14">
        {/* Left Column: Project Overview Data */}
        <div className="w-full shrink-0 space-y-6 lg:w-120 xl:w-130">
          <div className="space-y-2">
            <h1 className="text-heading text-2xl font-medium tracking-tight xl:text-3xl">
              {project.name}
            </h1>

            <div className="text-description flex items-center gap-1.5 text-xs">
              <span className="text-muted">Project code:</span>
              <span className="text-body font-mono font-medium">
                {project.project_code}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(project.project_code)}
                className="hover:border-border-hover border-border text-body inline-flex cursor-pointer items-center gap-1 rounded-md border bg-white px-2 py-0.5 text-xs font-medium transition-colors hover:bg-zinc-50"
                title="Copy project code"
              >
                {copiedCode ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="text-muted h-3 w-3" />
                )}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-4">
            {/* 1. STATUS */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-2xs">
                <GripHorizontal
                  fill="currentColor"
                  className="h-10 w-10 stroke-[1.5] text-zinc-700"
                />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                  STATUS
                </p>
                <p className="text-sm font-medium text-zinc-800">
                  {project.status}
                </p>
              </div>
            </div>

            {/* 2. DIALECT */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-2xs">
                <Database className="h-5 w-5 stroke-[1.5] text-zinc-700" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                  DIALECT
                </p>
                <div>
                  <span className="inline-block rounded border border-zinc-200 px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-600 uppercase">
                    {project.dialect}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. SYSTEM FLOWS */}
            <Link
              href={`/workspace/projects/${project.project_code}/flows`}
              className="group flex items-center gap-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-2xs transition-all group-hover:border-zinc-300 group-hover:shadow-xs">
                <Workflow className="h-5 w-5 stroke-[1.5] text-zinc-700" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                  SYSTEM FLOWS
                </p>
                <p className="text-sm font-medium text-zinc-800 transition-colors group-hover:text-emerald-700">
                  {project.flows_count} Diagrams
                </p>
              </div>
            </Link>

            {/* 4. DATABASE SCHEMA */}
            <Link
              href={`/workspace/projects/${project.project_code}/schemas`}
              className="group flex items-center gap-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-2xs transition-all group-hover:border-zinc-300 group-hover:shadow-xs">
                <Layers className="h-5 w-5 stroke-[1.5] text-zinc-700" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                  DATABASE SCHEMA
                </p>
                <p className="text-sm font-medium text-zinc-800 transition-colors group-hover:text-emerald-700">
                  {project.tables_count} Tables ({project.relations_count} FK)
                </p>
              </div>
            </Link>

            {/* 5. DOCUMENTS */}
            <Link
              href={`/workspace/projects/${project.project_code}/documents`}
              className="group flex items-center gap-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-2xs transition-all group-hover:border-zinc-300 group-hover:shadow-xs">
                <FileText className="h-5 w-5 stroke-[1.5] text-zinc-700" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                  DOCUMENTS
                </p>
                <p className="text-sm font-medium text-zinc-800 transition-colors group-hover:text-emerald-700">
                  {project.documents_count} Specs
                </p>
              </div>
            </Link>

            {/* 6. LAST BACKUP */}
            <Link
              href={`/workspace/projects/${project.project_code}/backups`}
              className="group flex items-center gap-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-2xs transition-all group-hover:border-zinc-300 group-hover:shadow-xs">
                <HardDriveDownload className="h-5 w-5 stroke-[1.5] text-zinc-700" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                  LAST BACKUP
                </p>
                <p className="text-sm font-medium text-zinc-800 transition-colors group-hover:text-emerald-700">
                  {project.backup_status}
                  {project.backup_size ? ` · ${project.backup_size}` : ""}
                </p>
              </div>
            </Link>
          </div>

          {/* Members, Pending Invites, and Timestamps Section */}
          <div className="space-y-5 border-t border-zinc-100 pt-6">
            {/* Team / Members Stack */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                  MEMBERS
                </p>
                {project.pending_invites_count > 0 && (
                  <Link
                    href={`/workspace/projects/${project.project_code}/team`}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{project.pending_invites_count} pending invite</span>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Profile Stack */}
                <div className="flex -space-x-2 overflow-hidden">
                  {project.members.map((member) => (
                    <div
                      key={member.id}
                      title={`${member.name} (${member.role})`}
                      className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white text-[11px] font-semibold text-white shadow-2xs ${
                        member.avatar_url ? "bg-zinc-100" : member.bg
                      }`}
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        member.initials
                      )}
                    </div>
                  ))}
                </div>

                {/* Plus button to invite more */}
                <Link
                  href={`/workspace/projects/${project.project_code}/team`}
                  title="Invite members"
                  className="text-muted flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-zinc-200 transition-colors hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Created At & Last Updated */}
            <div className="grid grid-cols-2 gap-x-8 pt-1">
              <div className="space-y-0.5">
                <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                  CREATED AT
                </p>
                <p className="text-sm font-medium text-zinc-800">
                  {project.formatted_created_at}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                  LAST UPDATED
                </p>
                <p className="text-sm font-medium text-zinc-800">
                  {project.formatted_updated_at}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Architecture Canvas Container */}
        <ProjectCanvas />
      </div>
    </div>
  );
};

export default ProjectDetailPage;
