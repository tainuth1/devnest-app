"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Plus,
  X,
  FolderGit2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Project,
  ProjectStatus,
  PROJECT_STATUSES,
  PROJECT_STATUS_CONFIG,
} from "@/features/project/types";
import { USAGE_METRICS } from "@/shared/data/mock-data";
import { useProjects } from "@/features/project/hooks/use-projects";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { ProjectCard } from "@/features/project/components/project-card";
import { ProjectListRow } from "@/features/project/components/project-list-row";
import { UpgradeModal } from "@/features/project/components/upgrade-modal";
import { NewProjectModal } from "@/features/project/components/new-project-modal";
import { UsagePanel } from "@/features/project/components/usage-panel";
import {
  Button,
  Input,
  Select,
  SelectOption,
  toast,
} from "@/shared/components/ui";

type SortOption = "order" | "name" | "updated" | "created";

const ProjectManagementPage = () => {
  // Filters & UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("order");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Backend API Hook
  const { projects, isLoading, error, refetch, updateStatus, setProjects } =
    useProjects({
      status: statusFilter !== "All" ? statusFilter : undefined,
      sort_by:
        sortBy === "updated"
          ? "updated_at"
          : sortBy === "created"
            ? "created_at"
            : sortBy,
      q: debouncedSearch.trim() || undefined,
    });

  // Modals
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const statusOptions: SelectOption<string>[] = useMemo(
    () => [
      { value: "All", label: "All statuses" },
      ...PROJECT_STATUSES.map((status, idx) => ({
        value: status.label,
        label: status.label,
        dotColor: PROJECT_STATUS_CONFIG[status.label]?.dotColor || "bg-muted",
        dividerAbove: idx === 0,
      })),
    ],
    []
  );

  const sortOptions: SelectOption<SortOption>[] = useMemo(
    () => [
      { value: "order", label: "Custom order" },
      { value: "name", label: "Sorted by name" },
      { value: "updated", label: "Sorted by recently updated" },
      { value: "created", label: "Sorted by created date" },
    ],
    []
  );

  const showToast = (message: string) => {
    toast.success(message);
  };

  const handleStatusChange = async (id: string, newStatus: ProjectStatus) => {
    try {
      await updateStatus(id, newStatus);
      toast.success(`Project status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update project status.");
    }
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    showToast(`Project "${newProject.name}" created successfully!`);
  };

  // In-memory filter/sort fallback for instantaneous response while typing
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          project.name.toLowerCase().includes(query) ||
          (project.description &&
            project.description.toLowerCase().includes(query)) ||
          (project.project_code &&
            project.project_code.toLowerCase().includes(query)) ||
          (project.slug && project.slug.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "All" || project.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "order") {
          return (a.order_index ?? 0) - (b.order_index ?? 0);
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "updated") {
          const aDate = a.updated_at || a.updatedAt || "";
          const bDate = b.updated_at || b.updatedAt || "";
          return bDate.localeCompare(aDate);
        }
        if (sortBy === "created") {
          const aDate = a.created_at || a.createdAt || "";
          const bDate = b.created_at || b.createdAt || "";
          return bDate.localeCompare(aDate);
        }
        return 0;
      });
  }, [projects, searchQuery, statusFilter, sortBy]);

  const sortLabelMap: Record<SortOption, string> = {
    order: "Custom order",
    name: "Sorted by name",
    updated: "Sorted by recently updated",
    created: "Sorted by created date",
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Heading */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Projects
          </h1>
        </div>
      </div>

      {/* Toolbar / Action Controls */}
      <div className="flex flex-col gap-3 pb-6 md:flex-row md:items-center md:justify-between">
        {/* Left Toolbar: Search + Filter + Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code, or description"
            leftIcon={<Search />}
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted hover:text-heading cursor-pointer"
                  aria-label="Clear search"
                >
                  <X />
                </button>
              ) : null
            }
            fullWidth={false}
            wrapperClassName="min-w-60 sm:min-w-70"
          />

          {/* Status Dropdown */}
          <Select
            size="md"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={statusOptions}
            clearable
            isCleared={statusFilter === "All"}
            onClear={() => setStatusFilter("All")}
            renderTrigger={() => (
              <span className="flex items-center gap-1.5">
                {statusFilter !== "All" && (
                  <span
                    className={`h-2 w-2 rounded-full ${
                      PROJECT_STATUS_CONFIG[statusFilter as ProjectStatus]
                        ?.dotColor || "bg-zinc-400"
                    }`}
                  />
                )}
                <span>
                  {statusFilter === "All"
                    ? "Status: All"
                    : `Status: ${statusFilter}`}
                </span>
              </span>
            )}
            menuClassName="w-44"
          />

          {/* Sort Dropdown */}
          <Select
            size="md"
            value={sortBy}
            onChange={(val) => setSortBy(val as SortOption)}
            options={sortOptions}
            leftIcon={<ArrowUpDown className="text-muted h-3 w-3" />}
            renderTrigger={() => (
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="text-muted h-3 w-3 shrink-0" />
                <span>{sortLabelMap[sortBy]}</span>
              </span>
            )}
            menuClassName="w-55"
          />
        </div>

        {/* Right Toolbar: View mode toggles + "+ New project" Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* View Mode Toggle Button Group */}
          <div className="border-border flex items-center rounded-md border bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-colors ${
                viewMode === "grid"
                  ? "text-heading bg-zinc-100"
                  : "text-muted hover:text-body"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="List View"
              className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-colors ${
                viewMode === "list"
                  ? "text-heading bg-zinc-100"
                  : "text-muted hover:text-body"
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* New project Primary Button */}
          <Link href="/workspace/projects/new">
            <Button leftIcon={<Plus className="stroke-[2.5]" />}>
              New project
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left Column: Projects Grid / List */}
        <div className="lg:col-span-8">
          {error ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/40 py-12 text-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold text-red-900">
                Failed to load projects
              </h3>
              <p className="mt-1 max-w-sm text-xs text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-2xs hover:bg-red-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : isLoading && projects.length === 0 ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border-border flex h-36 animate-pulse flex-col justify-between rounded-xl border bg-white p-5 shadow-2xs"
                >
                  <div>
                    <div className="h-4 w-3/4 rounded bg-zinc-200" />
                    <div className="mt-2.5 h-3 w-1/2 rounded bg-zinc-100" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-4 w-16 rounded bg-zinc-100" />
                    <div className="h-5 w-24 rounded-full bg-zinc-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            /* Empty State */
            <div className="border-border flex flex-col items-center justify-center rounded-2xl border border-dashed bg-zinc-50/50 py-16 text-center">
              <div className="text-muted flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
                <FolderGit2 className="h-6 w-6" />
              </div>
              <h3 className="text-heading mt-3 text-sm font-semibold">
                No projects found
              </h3>
              <p className="text-description mt-1 text-xs">
                {searchQuery || statusFilter !== "All"
                  ? "No projects matched your search criteria."
                  : "You haven't created or joined any projects yet."}
              </p>
              {searchQuery || statusFilter !== "All" ? (
                <Button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All");
                  }}
                  size="sm"
                  className="mt-4"
                  variant="outline"
                >
                  Clear filters
                </Button>
              ) : (
                <Link className="mt-4" href="/workspace/projects/new">
                  <Button size="sm" leftIcon={<Plus />}>
                    Create Project
                  </Button>
                </Link>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onStatusChange={handleStatusChange}
                  onCopyNotice={showToast}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="border-border rounded-xl border bg-white shadow-2xs">
              {/* Table Header */}
              <div className="border-border text-description flex items-center justify-between rounded-t-xl border-b bg-zinc-50 px-4 py-2 text-[11px] font-medium">
                <div className="md:w-1/3">Project</div>
                <div className="hidden sm:block md:w-1/6">Role</div>
                <div className="md:w-1/6">Status</div>
                <div className="hidden md:block md:w-1/6">Last updated</div>
                <div className="w-8 text-right">Action</div>
              </div>
              {/* Rows */}
              <div className="rounded-b-xl">
                {filteredProjects.map((project) => (
                  <ProjectListRow
                    key={project.id}
                    project={project}
                    onStatusChange={handleStatusChange}
                    onCopyNotice={showToast}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Usage Panel */}
        <div className="lg:col-span-4">
          <div className="border-border rounded-xl border bg-white p-5 shadow-2xs">
            <UsagePanel
              metrics={USAGE_METRICS}
              onUpgradeClick={() => setIsUpgradeOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onConfirmUpgrade={() => {
          showToast("Upgraded successfully!");
        }}
      />
    </div>
  );
};

export default ProjectManagementPage;
