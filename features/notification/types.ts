export type NotificationType =
  // Collaboration & Team
  | "PROJECT_INVITATION"
  | "PROJECT_INVITATION_ACCEPTED"
  | "PROJECT_INVITATION_DECLINED"
  | "MEMBER_ROLE_CHANGED"
  | "MEMBER_REMOVED"
  // Ownership Transfer (2-Step Handshake)
  | "OWNERSHIP_TRANSFER_REQUEST"
  | "OWNERSHIP_TRANSFER_ACCEPTED"
  | "OWNERSHIP_TRANSFER_REJECTED"
  | "OWNERSHIP_TRANSFER_EXPIRED"
  // Backups & Snapshots
  | "BACKUP_COMPLETED"
  | "BACKUP_FAILED"
  // AI & Architecture
  | "AI_PROPOSAL_READY"
  // Security & System
  | "SECURITY_ALERT"
  | "SYSTEM_ANNOUNCEMENT";

export type NotificationCategory =
  "COLLABORATION" | "OWNERSHIP" | "BACKUP" | "AI" | "SECURITY" | "SYSTEM";

export type NotificationActionStatus =
  "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "DISMISSED";

export interface NotificationActor {
  id: string;
  email: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
}

export interface NotificationDataPayload {
  project_id?: string;
  project_code?: string;
  project_name?: string;
  role?: string;
  invitation_id?: string;
  invitation_token?: string;
  transfer_id?: string;
  old_role?: string;
  new_role?: string;
  member_user_id?: string;
  expires_at?: string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: string;
  user_id: string;
  actor_id?: string | null;
  project_id?: string | null;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  link_url?: string | null;
  data: NotificationDataPayload;
  is_read: boolean;
  action_status?: NotificationActionStatus | string | null;
  read_at?: string | null;
  created_at: string;
  actor?: NotificationActor | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface NotificationListResponseData {
  items: AppNotification[];
  pagination: PaginationInfo;
  unread_count: number;
}

export interface UnreadCountResponseData {
  unread_count: number;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
  category?: NotificationCategory | string;
  type?: NotificationType | string;
}

export interface NotificationActionRequest {
  action: NotificationActionStatus | string;
}
