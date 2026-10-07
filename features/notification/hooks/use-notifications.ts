"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { AppNotification } from "../types";
import { NotificationService } from "../services/notification.service";
import { toast } from "@/shared/components/ui/toast";
import { ApiError } from "@/shared/types";

export interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  activeFilter: "all" | "unread";
  setActiveFilter: (filter: "all" | "unread") => void;
  filteredNotifications: AppNotification[];
  refetch: () => Promise<void>;
  refetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  acceptInvitation: (notification: AppNotification) => Promise<void>;
  declineInvitation: (notification: AppNotification) => Promise<void>;
  isActionLoading: (id: string) => boolean;
}

export function useNotifications(options?: {
  pollIntervalMs?: number;
  autoFetch?: boolean;
}): UseNotificationsReturn {
  const { pollIntervalMs = 30000, autoFetch = true } = options || {};

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [actionLoadingMap, setActionLoadingMap] = useState<
    Record<string, boolean>
  >({});
  const [, startTransition] = useTransition();

  // Fast fetch for badge counter
  const refetchUnreadCount = useCallback(async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      startTransition(() => {
        setUnreadCount(count);
      });
    } catch {
      // Silent catch for background badge updates
    }
  }, []);

  // Full notifications list fetch
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await NotificationService.getNotifications({ limit: 40 });
      startTransition(() => {
        setNotifications(res.items);
        setUnreadCount(res.unread_count);
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load notifications.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (!isMounted) return;
      if (autoFetch) {
        void fetchNotifications();
      } else {
        void refetchUnreadCount();
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [autoFetch, fetchNotifications, refetchUnreadCount]);

  // Periodic polling for badge counter
  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs <= 0) return;
    const interval = setInterval(() => {
      refetchUnreadCount();
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs, refetchUnreadCount]);

  // In-Place: Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      startTransition(() => {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_read: true } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });
    } catch {
      // Fallback
    }
  }, []);

  // In-Place: Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      startTransition(() => {
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, is_read: true }))
        );
        setUnreadCount(0);
      });
      toast.success("All notifications marked as read.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to mark all as read.";
      toast.error(msg);
    }
  }, []);

  // In-Place: Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      const target = notifications.find((n) => n.id === id);
      try {
        await NotificationService.deleteNotification(id);
        startTransition(() => {
          setNotifications((prev) => prev.filter((item) => item.id !== id));
          if (target && !target.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        });
        toast.success("Notification removed.");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to remove notification.";
        toast.error(msg);
      }
    },
    [notifications]
  );

  // In-Place: Accept invitation action
  const acceptInvitation = useCallback(
    async (notification: AppNotification) => {
      const token = notification.data.invitation_token;
      if (!token) {
        toast.error("Invitation token not found.");
        return;
      }
      setActionLoadingMap((prev) => ({ ...prev, [notification.id]: true }));
      try {
        await NotificationService.acceptInvitation(token);
        await NotificationService.updateActionStatus(
          notification.id,
          "ACCEPTED"
        );
        startTransition(() => {
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === notification.id
                ? { ...item, action_status: "ACCEPTED", is_read: true }
                : item
            )
          );
          if (!notification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        });
        toast.success(
          `You joined ${notification.data.project_name || "the project"}!`
        );
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to accept invitation.";
        toast.error(msg);
      } finally {
        setActionLoadingMap((prev) => ({ ...prev, [notification.id]: false }));
      }
    },
    []
  );

  // In-Place: Decline invitation action
  const declineInvitation = useCallback(
    async (notification: AppNotification) => {
      const token = notification.data.invitation_token;
      if (!token) {
        toast.error("Invitation token not found.");
        return;
      }
      setActionLoadingMap((prev) => ({ ...prev, [notification.id]: true }));
      try {
        await NotificationService.declineInvitation(token);
        await NotificationService.updateActionStatus(
          notification.id,
          "DECLINED"
        );
        startTransition(() => {
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === notification.id
                ? { ...item, action_status: "DECLINED", is_read: true }
                : item
            )
          );
          if (!notification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        });
        toast.success("Invitation declined.");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to decline invitation.";
        toast.error(msg);
      } finally {
        setActionLoadingMap((prev) => ({ ...prev, [notification.id]: false }));
      }
    },
    []
  );

  const isActionLoading = useCallback(
    (id: string) => Boolean(actionLoadingMap[id]),
    [actionLoadingMap]
  );

  const filteredNotifications =
    activeFilter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    filteredNotifications,
    refetch: fetchNotifications,
    refetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    acceptInvitation,
    declineInvitation,
    isActionLoading,
  };
}
