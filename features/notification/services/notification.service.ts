import { apiClient } from "@/shared/services/api-client";
import {
  AppNotification,
  GetNotificationsParams,
  NotificationActionRequest,
  NotificationListResponseData,
  UnreadCountResponseData,
} from "../types";

export class NotificationService {
  /**
   * Fetch paginated notifications for current user with optional filters.
   * Path: GET /api/notifications
   */
  public static async getNotifications(
    params?: GetNotificationsParams
  ): Promise<NotificationListResponseData> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (typeof params?.is_read === "boolean")
      query.set("is_read", String(params.is_read));
    if (params?.category) query.set("category", params.category);
    if (params?.type) query.set("type", params.type);

    const qs = query.toString();
    const endpoint = `/api/notifications${qs ? `?${qs}` : ""}`;

    const response =
      await apiClient.get<NotificationListResponseData>(endpoint);
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
        unread_count: 0,
      }
    );
  }

  /**
   * Fast query for unread badge count on the header bell button.
   * Path: GET /api/notifications/unread-count
   */
  public static async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponseData>(
      "/api/notifications/unread-count"
    );
    return response.data?.unread_count ?? 0;
  }

  /**
   * Mark a single notification as read.
   * Path: PATCH /api/notifications/{notification_id}/read
   */
  public static async markAsRead(
    notificationId: string
  ): Promise<AppNotification> {
    const response = await apiClient.patch<AppNotification>(
      `/api/notifications/${notificationId}/read`
    );
    if (!response.data) {
      throw new Error(
        response.message || "Failed to mark notification as read"
      );
    }
    return response.data;
  }

  /**
   * Mark all unread notifications as read.
   * Path: PATCH /api/notifications/mark-all-read
   */
  public static async markAllAsRead(): Promise<number> {
    const response = await apiClient.patch<{ updated_count: number }>(
      "/api/notifications/mark-all-read"
    );
    return response.data?.updated_count ?? 0;
  }

  /**
   * Record interactive action status (e.g. ACCEPTED, DECLINED, DISMISSED).
   * Path: PATCH /api/notifications/{notification_id}/action
   */
  public static async updateActionStatus(
    notificationId: string,
    action: string
  ): Promise<AppNotification> {
    const response = await apiClient.patch<AppNotification>(
      `/api/notifications/${notificationId}/action`,
      { action } as NotificationActionRequest
    );
    if (!response.data) {
      throw new Error(
        response.message || "Failed to update notification action"
      );
    }
    return response.data;
  }

  /**
   * Dismiss/delete a notification.
   * Path: DELETE /api/notifications/{notification_id}
   */
  public static async deleteNotification(
    notificationId: string
  ): Promise<void> {
    await apiClient.delete(`/api/notifications/${notificationId}`);
  }

  /**
   * Accept an invitation directly via its token.
   * Path: POST /api/invitations/{token}/accept
   */
  public static async acceptInvitation(token: string): Promise<unknown> {
    const response = await apiClient.post(`/api/invitations/${token}/accept`);
    return response.data;
  }

  /**
   * Decline an invitation directly via its token.
   * Path: POST /api/invitations/{token}/decline
   */
  public static async declineInvitation(token: string): Promise<unknown> {
    const response = await apiClient.post(`/api/invitations/${token}/decline`);
    return response.data;
  }
}
