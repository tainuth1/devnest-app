"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Project,
  ProjectStatus,
  PaginationInfo,
  GetProjectsParams,
} from "../types";
import { ProjectsService } from "../services/project.service";
import { ApiError } from "@/shared/types";

export interface UseProjectsOptions extends GetProjectsParams {
  enabled?: boolean;
}

export interface UseProjectsReturn {
  projects: Project[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStatus: (id: string, newStatus: ProjectStatus) => Promise<void>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export function useProjects(
  options: UseProjectsOptions = {}
): UseProjectsReturn {
  const {
    page = 1,
    limit = 20,
    status: statusFilter,
    role: roleFilter,
    sort_by: sortBy = "order",
    order_dir: orderDir = "asc",
    q: searchQuery,
    enabled = true,
  } = options;

  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ProjectsService.getProjects({
        page,
        limit,
        status: statusFilter,
        role: roleFilter,
        sort_by: sortBy,
        order_dir: orderDir,
        q: searchQuery,
      });
      setProjects(data.items);
      setPagination(data.pagination);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load projects.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    page,
    limit,
    statusFilter,
    roleFilter,
    sortBy,
    orderDir,
    searchQuery,
  ]);

  useEffect(() => {
    let isCancelled = false;

    if (!enabled) {
      return;
    }

    async function load() {
      try {
        const data = await ProjectsService.getProjects({
          page,
          limit,
          status: statusFilter,
          role: roleFilter,
          sort_by: sortBy,
          order_dir: orderDir,
          q: searchQuery,
        });
        if (!isCancelled) {
          setProjects(data.items);
          setPagination(data.pagination);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          const message =
            err instanceof ApiError ? err.message : "Failed to load projects.";
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [
    enabled,
    page,
    limit,
    statusFilter,
    roleFilter,
    sortBy,
    orderDir,
    searchQuery,
  ]);

  // In-Place Mutation for status change (no redundant full list refetch)
  const updateStatus = async (
    id: string,
    newStatus: ProjectStatus
  ): Promise<void> => {
    // 1. Optimistic update
    const previousProjects = [...projects];
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === id ? { ...proj, status: newStatus } : proj
      )
    );

    try {
      // 2. Persist to API
      await ProjectsService.updateProjectStatus(id, newStatus);
    } catch (err) {
      // 3. Rollback on failure
      setProjects(previousProjects);
      throw err;
    }
  };

  return {
    projects,
    pagination,
    isLoading,
    error,
    refetch: fetchProjects,
    updateStatus,
    setProjects,
  };
}
