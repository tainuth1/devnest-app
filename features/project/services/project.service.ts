import { apiClient } from "@/shared/services/api-client";
import {
  Project,
  ProjectListResponseData,
  GetProjectsParams,
  ProjectStatus,
  CreateProjectRequest,
  ProjectOverviewData,
} from "../types";

export class ProjectsService {
  /**
   * Fetch all projects where the authenticated user is an active member.
   * Supports pagination, status filtering, role filtering, sorting, and search.
   */
  public static async getProjects(
    params?: GetProjectsParams
  ): Promise<ProjectListResponseData> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", String(params.page));
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.status && params.status !== "All") {
      queryParams.set("status", params.status);
    }
    if (params?.role && params.role !== "all") {
      queryParams.set("role", params.role);
    }
    if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
    if (params?.order_dir) queryParams.set("order_dir", params.order_dir);
    if (params?.q) queryParams.set("q", params.q);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/api/projects?${queryString}`
      : "/api/projects";

    const response = await apiClient.get<ProjectListResponseData>(endpoint);
    return (
      response.data ?? {
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      }
    );
  }

  /**
   * Update the operational lifecycle status of a project.
   */
  public static async updateProjectStatus(
    id: string,
    status: ProjectStatus
  ): Promise<{
    id: string;
    project_code: string;
    status: ProjectStatus;
    updated_at: string;
  }> {
    const response = await apiClient.patch<{
      id: string;
      project_code: string;
      status: ProjectStatus;
      updated_at: string;
    }>(`/api/projects/${id}/status`, { status });

    if (!response.data) {
      throw new Error(response.message || "Failed to update project status");
    }
    return response.data;
  }

  /**
   * Fetch project workspace summary by its 20-character project_code.
   */
  public static async getProjectByCode(
    projectCode: string
  ): Promise<ProjectOverviewData> {
    const response = await apiClient.get<ProjectOverviewData>(
      `/api/projects/${projectCode}`
    );
    if (!response.data) {
      throw new Error(response.message || "Project not found");
    }
    return response.data;
  }

  /**
   * Create a new project workspace.
   */
  public static async createProject(
    data: CreateProjectRequest
  ): Promise<Project> {
    const response = await apiClient.post<Project>("/api/projects", data);
    if (!response.data) {
      throw new Error(response.message || "Failed to create project");
    }
    return response.data;
  }
}
