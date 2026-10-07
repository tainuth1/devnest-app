export type ProjectStatus =
  | "Not Started"
  | "In Progress"
  | "On Hold"
  | "Blocked"
  | "In Review"
  | "Completed"
  | "Cancelled";

export type ProjectRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export type ComputeTier = "NANO" | "MICRO" | "SMALL" | "MEDIUM" | "LARGE";

export interface Project {
  id: string;
  project_code?: string;
  name: string;
  slug?: string;
  description?: string | null;
  status: ProjectStatus;
  order_index?: number;
  is_pinned?: boolean;
  color?: string;
  icon?: string;
  my_role?: ProjectRole | string;
  members_count?: number;
  created_at?: string;
  updated_at?: string;

  // Backward-compatibility fields
  ref?: string;
  region?: string;
  regionName?: string;
  tier?: ComputeTier | string;
  databaseVersion?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ProjectMemberOverview {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatar_url?: string | null;
  bg?: string;
}

export interface ProjectOverviewData {
  id: string;
  project_code: string;
  name: string;
  status: ProjectStatus;
  dialect: string;
  flows_count: number;
  tables_count: number;
  relations_count: number;
  documents_count: number;
  backup_status: string;
  backup_size?: string | null;
  created_at: string;
  updated_at: string;
  pending_invites_count: number;
  members: ProjectMemberOverview[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProjectListResponseData {
  items: Project[];
  pagination: PaginationInfo;
}

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
  sort_by?: "order" | "name" | "updated_at" | "created_at";
  order_dir?: "asc" | "desc";
  q?: string;
}

export interface ProjectSettings {
  default_sql_dialect?: string;
  auto_save_interval_ms?: number;
  environment?: string;
  enable_api_access?: boolean;
  enable_audit_logs?: boolean;
  auto_backup?: boolean;
  [key: string]: unknown;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  settings?: ProjectSettings | Record<string, unknown>;
}

export interface UpdateProjectStatusRequest {
  status: ProjectStatus;
}

export interface ProjectStatusItem {
  id: string;
  label: ProjectStatus;
}

export const PROJECT_STATUSES: ProjectStatusItem[] = [
  {
    id: "not_started",
    label: "Not Started",
  },
  {
    id: "in_progress",
    label: "In Progress",
  },
  {
    id: "on_hold",
    label: "On Hold",
  },
  {
    id: "blocked",
    label: "Blocked",
  },
  {
    id: "in_review",
    label: "In Review",
  },
  {
    id: "completed",
    label: "Completed",
  },
  {
    id: "cancelled",
    label: "Cancelled",
  },
];

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  {
    dotColor: string;
    badgeBg: string;
    badgeText: string;
    border: string;
  }
> = {
  "Not Started": {
    dotColor: "bg-zinc-400 ring-2 ring-zinc-400/20",
    badgeBg: "bg-zinc-100",
    badgeText: "text-description",
    border: "border-border",
  },
  "In Progress": {
    dotColor: "bg-sky-500 ring-2 ring-sky-500/20",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
    border: "border-sky-200",
  },
  "On Hold": {
    dotColor: "bg-amber-400 ring-2 ring-amber-400/20",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    border: "border-amber-200",
  },
  Blocked: {
    dotColor: "bg-red-500 ring-2 ring-red-500/20",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    border: "border-red-200",
  },
  "In Review": {
    dotColor: "bg-purple-500 ring-2 ring-purple-500/20",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    border: "border-purple-200",
  },
  Completed: {
    dotColor: "bg-emerald-500 ring-2 ring-emerald-500/20",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    border: "border-emerald-200",
  },
  Cancelled: {
    dotColor: "bg-zinc-400 ring-2 ring-zinc-400/20",
    badgeBg: "bg-zinc-100",
    badgeText: "text-description",
    border: "border-border",
  },
};

export interface UsageMetric {
  id: string;
  label: string;
  used: number;
  limit: number;
  unit: string;
  formattedUsed: string;
  formattedLimit: string;
  percentage: number;
  description: string;
}
