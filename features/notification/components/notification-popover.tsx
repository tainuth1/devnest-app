"use client";

import React, { forwardRef } from "react";
import { CheckCheck, Inbox, Loader2 } from "lucide-react";
import { AppNotification } from "../types";
import { NotificationItem } from "./notification-item";
import { cn } from "@/shared/utils/cn";

interface NotificationPopoverProps {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  activeFilter: "all" | "unread";
  onFilterChange: (filter: "all" | "unread") => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onAcceptInvite: (notification: AppNotification) => void;
  onDeclineInvite: (notification: AppNotification) => void;
  isActionLoading: (id: string) => boolean;
  onClose?: () => void;
}

export const NotificationPopover = forwardRef<
  HTMLDivElement,
  NotificationPopoverProps
>(
  (
    {
      notifications,
      unreadCount,
      isLoading,
      activeFilter,
      onFilterChange,
      onMarkAsRead,
      onMarkAllAsRead,
      onDelete,
      onAcceptInvite,
      onDeclineInvite,
      isActionLoading,
      onClose,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="border-border bg-background absolute right-0 z-50 mt-1.5 flex w-100 flex-col overflow-hidden rounded-xl border shadow-xl sm:w-130"
        style={{ maxHeight: "calc(100vh - 5rem)" }}
      >
        {/* Header Bar */}
        <div className="border-border-subtle bg-border-subtle/50 flex items-center justify-between border-b px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-heading text-xs font-semibold">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="py-0.2 border-primary/20 bg-primary/10 text-primary rounded-full border px-1.5 text-[10px] font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-description hover:text-heading flex items-center gap-1 text-[11px] font-medium transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs (All / Unread) */}
        <div className="border-border-subtle bg-background flex items-center gap-1 border-b px-3.5 py-1.5 text-xs">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={cn(
              "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              activeFilter === "all"
                ? "text-heading bg-border-subtle font-semibold"
                : "text-description hover:text-body hover:bg-border-subtle"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("unread")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              activeFilter === "unread"
                ? "text-heading bg-border-subtle font-semibold"
                : "text-description hover:text-body hover:bg-border-subtle"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Notification List */}
        <div className="divide-border-subtle max-h-88 flex-1 divide-y overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Loader2 className="text-description h-5 w-5 animate-spin" />
              <p className="text-description mt-2 text-xs">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="text-muted bg-border-subtle flex h-10 w-10 items-center justify-center rounded-full">
                <Inbox className="h-5 w-5 stroke-[1.5]" />
              </div>
              <p className="text-heading mt-2 text-xs font-medium">
                {activeFilter === "unread"
                  ? "All caught up!"
                  : "No notifications yet"}
              </p>
              <p className="text-description mt-0.5 max-w-xs text-[11px]">
                {activeFilter === "unread"
                  ? "You have no unread notifications right now."
                  : "When team invitations, updates, or alerts arrive, they will appear here."}
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onAcceptInvite={onAcceptInvite}
                onDeclineInvite={onDeclineInvite}
                isLoadingAction={isActionLoading(notif.id)}
                onItemClick={() => {
                  if (onClose) onClose();
                }}
              />
            ))
          )}
        </div>

        {/* Popover Footer */}
        <div className="border-border-subtle bg-border-subtle/50 flex items-center justify-between border-t px-3.5 py-2 text-[11px]">
          <span className="text-description font-normal">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "All caught up"}
          </span>
          <span className="text-muted text-[10px]">DevNest Notifications</span>
        </div>
      </div>
    );
  }
);

NotificationPopover.displayName = "NotificationPopover";
