"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Copy,
  Check,
  Download,
  Settings,
  ChevronDown,
} from "lucide-react";
import {
  Project,
  ProjectStatus,
  PROJECT_STATUSES,
  PROJECT_STATUS_CONFIG,
} from "../types";
import Link from "next/link";

interface ProjectListRowProps {
  project: Project;
  onStatusChange?: (id: string, newStatus: ProjectStatus) => void;
  onCopyNotice?: (message: string) => void;
  onDownload?: (project: Project) => void;
}

export const ProjectListRow: React.FC<ProjectListRowProps> = ({
  project,
  onStatusChange,
  onCopyNotice,
  onDownload,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(target)) {
        setIsStatusMenuOpen(false);
      }
    };
    if (isMenuOpen || isStatusMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isStatusMenuOpen]);

  const projectCode = project.project_code || project.ref || project.id;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(projectCode);
    setCopiedCode(true);
    onCopyNotice?.(`Project code "${projectCode}" copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
    setIsMenuOpen(false);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(project);
    } else {
      onCopyNotice?.(`Downloading project "${project.name}"...`);
    }
    setIsMenuOpen(false);
  };

  const statusConfig = PROJECT_STATUS_CONFIG[project.status] || {
    dotColor: "bg-zinc-400 ring-2 ring-zinc-400/20",
    badgeBg: "bg-zinc-100",
    badgeText: "text-body",
    border: "border-border",
  };

  const formattedDate = project.updated_at
    ? new Date(project.updated_at).toLocaleDateString()
    : project.updatedAt || "Recently";

  return (
    <div
      className={`group border-border-subtle relative flex items-center justify-between border-b bg-white px-4 py-3.5 transition-colors last:rounded-b-xl last:border-b-0 hover:bg-slate-50 ${
        isMenuOpen || isStatusMenuOpen ? "z-30" : "z-auto"
      }`}
    >
      {/* Name and Description */}
      <div className="flex min-w-0 items-center gap-3 md:w-1/3">
        <div className="min-w-0">
          <h4 className="text-heading truncate text-sm font-semibold">
            <Link
              href={`/workspace/projects/${project.project_code || project.id}`}
              className="hover:underline focus:outline-none"
            >
              {project.name}
            </Link>
          </h4>
        </div>
      </div>

      {/* Role Badge */}
      <div className="hidden sm:block md:w-1/6">
        <span className="border-border text-body inline-flex items-center rounded border bg-zinc-50 px-2 py-0.5 font-mono text-[10px] font-medium uppercase">
          {project.my_role || "OWNER"}
        </span>
      </div>

      {/* Status with Quick Switcher Popover */}
      <div className="relative md:w-1/6" ref={statusMenuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsStatusMenuOpen((prev) => !prev);
            setIsMenuOpen(false);
          }}
          className="flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium transition-colors group-hover:bg-slate-200 focus:outline-none"
          title="Click to change status"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${statusConfig.dotColor}`}
          />
          <span className="text-body">{project.status}</span>
          <ChevronDown className="text-muted h-2.5 w-2.5" />
        </button>

        {isStatusMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="border-border text-body absolute top-full left-0 z-50 mt-1 w-44 rounded-xl border bg-white p-1 text-xs shadow-xl"
          >
            <div className="text-muted px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
              Change Status
            </div>
            {PROJECT_STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onStatusChange?.(project.id, s.label);
                  onCopyNotice?.(
                    `Project "${project.name}" status set to ${s.label}`
                  );
                  setIsStatusMenuOpen(false);
                }}
                className="hover:text-heading flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-zinc-100"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      PROJECT_STATUS_CONFIG[s.label]?.dotColor || "bg-zinc-400"
                    }`}
                  />
                  <span>{s.label}</span>
                </div>
                {project.status === s.label && (
                  <Check className="h-3 w-3 text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="text-muted hidden text-xs md:block md:w-1/6">
        {formattedDate}
      </div>

      {/* Actions */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen((prev) => !prev);
            setIsStatusMenuOpen(false);
          }}
          className="text-muted hover:text-body flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-zinc-100 focus:outline-none"
          aria-label={`Options for ${project.name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {isMenuOpen && (
          <div className="border-border text-body absolute right-0 z-50 mt-1 w-48 rounded-xl border bg-white p-1 text-xs shadow-xl">
            <button
              type="button"
              onClick={handleCopyCode}
              className="hover:text-heading flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors hover:bg-zinc-100"
            >
              <span className="flex items-center gap-2">
                {copiedCode ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="text-muted h-3.5 w-3.5" />
                )}
                Copy Code
              </span>
              <span className="text-muted font-mono text-[10px]">
                {projectCode.slice(0, 4)}...
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="hover:text-heading flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-zinc-100"
            >
              <Download className="text-muted h-3.5 w-3.5" />
              Download Project
            </button>

            <div className="border-border-subtle my-1 border-t" />

            <button
              type="button"
              onClick={() => {
                onCopyNotice?.(`Navigating to ${project.name} settings`);
                setIsMenuOpen(false);
              }}
              className="hover:text-heading flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-zinc-100"
            >
              <Settings className="text-muted h-3.5 w-3.5" />
              Project Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
