"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  UserCheck,
  UserX,
  UserMinus,
  Crown,
  ShieldCheck,
  ShieldAlert,
  Database,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Megaphone,
  Check,
  X,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  Loader2,
} from "lucide-react";
import { AppNotification, NotificationType } from "../types";
import { cn } from "@/shared/utils/cn";
import { formatRelativeTime } from "@/shared/utils/date";

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAcceptInvite?: (notification: AppNotification) => void;
  onDeclineInvite?: (notification: AppNotification) => void;
  onItemClick?: (notification: AppNotification) => void;
  isLoadingAction?: boolean;
}

interface TypeVisualConfig {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel?: string;
}

function getTypeVisualConfig(type: NotificationType): TypeVisualConfig {
  switch (type) {
    case "PROJECT_INVITATION":
      return {
        icon: UserPlus,
        iconBg: "border-primary/20 bg-primary/10",
        iconColor: "text-primary",
        badgeBg: "bg-primary/10",
        badgeText: "text-primary",
        badgeLabel: "Invitation",
      };
    case "PROJECT_INVITATION_ACCEPTED":
      return {
        icon: UserCheck,
        iconBg: "border-primary/20 bg-primary/10",
        iconColor: "text-primary",
        badgeBg: "bg-primary/10",
        badgeText: "text-primary",
        badgeLabel: "Accepted",
      };
    case "PROJECT_INVITATION_DECLINED":
      return {
        icon: UserX,
        iconBg: "border-border bg-border-subtle",
        iconColor: "text-muted",
        badgeBg: "bg-border-subtle",
        badgeText: "text-description",
        badgeLabel: "Declined",
      };
    case "OWNERSHIP_TRANSFER_REQUEST":
      return {
        icon: Crown,
        iconBg: "border-primary/20 bg-primary/10",
        iconColor: "text-primary",
        badgeBg: "bg-primary/10",
        badgeText: "text-primary",
        badgeLabel: "Ownership",
      };
    case "OWNERSHIP_TRANSFER_ACCEPTED":
      return {
        icon: Crown,
        iconBg: "border-primary/20 bg-primary/10",
        iconColor: "text-primary",
        badgeBg: "bg-primary/10",
        badgeText: "text-primary",
        badgeLabel: "Transferred",
      };
    case "OWNERSHIP_TRANSFER_REJECTED":
    case "OWNERSHIP_TRANSFER_EXPIRED":
      return {
        icon: AlertCircle,
        iconBg: "border-border bg-border-subtle",
        iconColor: "text-muted",
        badgeBg: "bg-border-subtle",
        badgeText: "text-description",
        badgeLabel: "Ownership",
      };
    case "MEMBER_ROLE_CHANGED":
      return {
        icon: ShieldCheck,
        iconBg: "border-primary/20 bg-primary/10",
        iconColor: "text-primary",
        badgeBg: "bg-primary/10",
        badgeText: "text-primary",
        badgeLabel: "Role Updated",
      };
    case "MEMBER_REMOVED":
      return {
        icon: UserMinus,
        iconBg: "border-border bg-border-subtle",
        iconColor: "text-muted",
        badgeBg: "bg-border-subtle",
        badgeText: "text-description",
        badgeLabel: "Team",
      };
    case "BACKUP_COMPLETED":
      return {
        icon: Database,
        iconBg: "border-primary/20 bg-primary/10",
        iconColor: "text-primary",
        badgeBg: "bg-primary/10",
        badgeText: "text-primary",
        badgeLabel: "Backup",
      };
    case "BACKUP_FAILED":
      return {
        icon: AlertTriangle,
        iconBg: "border-border bg-border-subtle",
        iconColor: "text-muted",
        badgeBg: "bg-border-subtle",
        badgeText: "text-description",
        badgeLabel: "Backup Alert",
      };
    case "AI_PROPOSAL_READY":
      return {
        icon: Sparkles,
        iconBg: "border-primary/20 bg-primary/10",
        iconColor: "text-primary",
        badgeBg: "bg-primary/10",
        badgeText: "text-primary",
        badgeLabel: "AI Assistant",
      };
    case "SECURITY_ALERT":
      return {
        icon: ShieldAlert,
        iconBg: "border-border bg-border-subtle",
        iconColor: "text-muted",
        badgeBg: "bg-border-subtle",
        badgeText: "text-description",
        badgeLabel: "Security",
      };
    case "SYSTEM_ANNOUNCEMENT":
    default:
      return {
        icon: Megaphone,
        iconBg: "border-primary/20 bg-primary/10",
        iconColor: "text-primary",
        badgeBg: "bg-primary/10",
        badgeText: "text-primary",
        badgeLabel: "System",
      };
  }
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAcceptInvite,
  onDeclineInvite,
  onItemClick,
  isLoadingAction = false,
}) => {
  const router = useRouter();
  const config = getTypeVisualConfig(notification.type);
  const IconComponent = config.icon;

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(notification);
    } else {
      if (!notification.is_read && onMarkAsRead) {
        onMarkAsRead(notification.id);
      }
      if (notification.link_url) {
        router.push(notification.link_url);
      }
    }
  };

  const actorInitials = notification.actor
    ? (
        notification.actor.first_name?.[0] ||
        notification.actor.username?.[0] ||
        notification.actor.email?.[0] ||
        "U"
      ).toUpperCase()
    : null;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group border-border-subtle hover:bg-border-subtle/80 relative flex cursor-pointer items-start gap-3 border-b p-3 transition-colors",
        !notification.is_read ? "bg-border-subtle/40" : "bg-background"
      )}
    >
      {/* Icon Badge or User Avatar */}
      <div className="relative mt-0.5 shrink-0">
        {notification.actor?.avatar_url ? (
          <div className="border-border relative h-8 w-8 overflow-hidden rounded-full border">
            <Image
              src={notification.actor.avatar_url}
              alt="Actor"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        ) : actorInitials &&
          (notification.type === "PROJECT_INVITATION" ||
            notification.type === "PROJECT_INVITATION_ACCEPTED") ? (
          <div className="bg-heading text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shadow-xs">
            {actorInitials}
          </div>
        ) : (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border",
              config.iconBg
            )}
          >
            <IconComponent className={cn("h-4 w-4", config.iconColor)} />
          </div>
        )}

        {/* Small Actor Badge if avatar shown */}
        {notification.actor?.avatar_url && (
          <div
            className={cn(
              "border-background absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border",
              config.iconBg
            )}
          >
            <IconComponent className={cn("h-2.5 w-2.5", config.iconColor)} />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1">
        {/* Title, Badge & Timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "py-0.2 rounded px-1.5 text-[10px] font-semibold tracking-wide uppercase",
                config.badgeBg,
                config.badgeText
              )}
            >
              {config.badgeLabel}
            </span>
            <h4
              className={cn(
                "truncate text-xs font-semibold",
                !notification.is_read ? "text-heading" : "text-body"
              )}
            >
              {notification.title}
            </h4>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-description text-[11px] font-normal">
              {formatRelativeTime(notification.created_at)}
            </span>
            {/* Unread dot */}
            {!notification.is_read && (
              <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
            )}
          </div>
        </div>

        {/* Message */}
        <p className="text-description mt-0.5 line-clamp-2 text-xs leading-relaxed">
          {notification.message}
        </p>

        {/* Type-Specific Interactive Actions */}
        {/* 1. Project Invitation Action Buttons */}
        {notification.type === "PROJECT_INVITATION" && (
          <div
            className="mt-2.5 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {notification.action_status === "PENDING" ? (
              <>
                <button
                  type="button"
                  disabled={isLoadingAction}
                  onClick={() => onAcceptInvite?.(notification)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 disabled:bg-primary/50 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium shadow-2xs transition-colors disabled:cursor-not-allowed"
                >
                  {isLoadingAction ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  )}
                  Accept
                </button>
                <button
                  type="button"
                  disabled={isLoadingAction}
                  onClick={() => onDeclineInvite?.(notification)}
                  className="border-border text-body hover:border-border-hover hover:text-heading hover:bg-border-subtle bg-background inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                  Decline
                </button>
              </>
            ) : notification.action_status === "ACCEPTED" ? (
              <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium">
                <Check className="text-primary h-3 w-3" />
                Joined as {String(notification.data.role || "Member")}
              </span>
            ) : (
              <span className="border-border bg-border-subtle text-description inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium">
                <X className="text-muted h-3 w-3" />
                Invitation Declined
              </span>
            )}
          </div>
        )}

        {/* 2. Ownership Transfer Notice */}
        {notification.type === "OWNERSHIP_TRANSFER_REQUEST" && (
          <div
            className="mt-2 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium">
              <Clock className="h-3 w-3" />
              Action required within 48h
            </span>
          </div>
        )}

        {/* 3. AI Proposal Review CTA */}
        {notification.type === "AI_PROPOSAL_READY" && notification.link_url && (
          <div className="mt-1.5">
            <span className="text-primary hover:text-primary/90 inline-flex items-center gap-1 text-[11px] font-medium transition-colors">
              Review staged proposal
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>

      {/* Hover Action Buttons (Mark read, Delete) */}
      <div
        className="ml-1 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.is_read && onMarkAsRead && (
          <button
            type="button"
            title="Mark as read"
            onClick={() => onMarkAsRead(notification.id)}
            className="text-muted hover:text-heading hover:bg-border-subtle flex h-6 w-6 items-center justify-center rounded transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            title="Remove notification"
            onClick={() => onDelete(notification.id)}
            className="text-muted hover:text-heading hover:bg-border-subtle flex h-6 w-6 items-center justify-center rounded transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
