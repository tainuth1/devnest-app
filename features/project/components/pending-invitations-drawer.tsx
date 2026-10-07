"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import {
  X,
  Mail,
  Clock,
  Trash2,
  Inbox,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { ProjectInvitation } from "../types";

export interface PendingInvitationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invitations: ProjectInvitation[];
  isLoading?: boolean;
  onRevoke: (invitationId: string, email: string) => Promise<void>;
  currentUserRole?: string;
  onRefresh?: () => void;
}

function formatRoleBadge(role: string): { label: string; className: string } {
  const upper = role.toUpperCase();
  if (upper === "ADMIN") {
    return {
      label: "Admin",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    };
  }
  if (upper === "EDITOR") {
    return {
      label: "Editor",
      className: "bg-sky-50 text-sky-700 border-sky-200",
    };
  }
  if (upper === "VIEWER") {
    return {
      label: "Viewer",
      className: "bg-zinc-100 text-zinc-700 border-zinc-200",
    };
  }
  return {
    label: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
    className: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };
}

function formatExpiration(expiresAt: string): string {
  try {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return "Expired";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    if (days > 1) return `Expires in ${days} days`;
    if (days === 1) return "Expires in 1 day";
    if (hours > 0) return `Expires in ${hours}h`;
    return "Expires soon";
  } catch {
    return "Expires in 7 days";
  }
}

function formatSentDate(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export const PendingInvitationsDrawer: React.FC<
  PendingInvitationsDrawerProps
> = ({
  isOpen,
  onClose,
  invitations,
  isLoading = false,
  onRevoke,
  currentUserRole,
  onRefresh,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const isOwner = currentUserRole?.toUpperCase() === "OWNER";
  const isAdmin = currentUserRole?.toUpperCase() === "ADMIN";

  const handleClose = useCallback(() => {
    if (revokingId) return;
    if (backdropRef.current && drawerRef.current) {
      gsap.killTweensOf([backdropRef.current, drawerRef.current]);
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });
      gsap.to(drawerRef.current, {
        x: "100%",
        duration: 0.25,
        ease: "power3.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  }, [onClose, revokingId]);

  // Entrance animation
  useEffect(() => {
    if (isOpen && backdropRef.current && drawerRef.current) {
      gsap.killTweensOf([backdropRef.current, drawerRef.current]);
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(
        drawerRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.3, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const canRevokeInvite = (inviteRole: string): boolean => {
    if (isOwner) return true;
    if (isAdmin) {
      // Admins can only manage Editor and Viewer invites
      const upper = inviteRole.toUpperCase();
      return upper === "EDITOR" || upper === "VIEWER";
    }
    return false;
  };

  const handleRevokeClick = async (invitation: ProjectInvitation) => {
    const email = invitation.invitee_email || invitation.email || "this user";
    setRevokingId(invitation.id);
    try {
      await onRevoke(invitation.id, email);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current && !revokingId) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
    >
      <div
        ref={drawerRef}
        className="border-border flex h-full w-full max-w-md flex-col border-l bg-white shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-heading text-base font-semibold">
                  Pending Invitations
                </h2>
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                  {invitations.length}
                </span>
              </div>
              <p className="text-description text-xs">
                Active invitations sent to collaborators
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh invitations"
                disabled={isLoading}
                className="text-muted hover:text-heading rounded-lg p-1.5 transition-colors hover:bg-zinc-100 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              disabled={Boolean(revokingId)}
              className="text-muted hover:text-heading rounded-lg p-1.5 transition-colors hover:bg-zinc-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-border animate-pulse space-y-3 rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-40 rounded bg-zinc-100" />
                    <div className="h-5 w-16 rounded bg-zinc-100" />
                  </div>
                  <div className="h-3 w-28 rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="border-border flex h-12 w-12 items-center justify-center rounded-full border bg-zinc-50 text-zinc-400">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="text-heading mt-4 text-sm font-semibold">
                No pending invitations
              </h3>
              <p className="text-description mt-1 max-w-xs text-xs">
                All invitations sent for this project have either been accepted
                or expired.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => {
                const badge = formatRoleBadge(invitation.role);
                const email =
                  invitation.invitee_email ||
                  invitation.email ||
                  "Unknown email";
                const isRevoking = revokingId === invitation.id;
                const canRevoke = canRevokeInvite(invitation.role);

                return (
                  <div
                    key={invitation.id}
                    className="border-border group relative rounded-xl border bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-xs"
                  >
                    {/* Top Row: Email & Role Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-heading truncate text-sm font-medium">
                            {email}
                          </span>
                        </div>
                        <div className="text-description mt-1 flex flex-wrap items-center gap-2 text-xs">
                          {invitation.created_at && (
                            <span>
                              Sent {formatSentDate(invitation.created_at)}
                            </span>
                          )}
                          <span className="text-zinc-300">•</span>
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <Clock className="h-3 w-3" />
                            {formatExpiration(invitation.expires_at)}
                          </span>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Bottom Row: Inviter and Action */}
                    <div className="border-border/60 mt-3.5 flex items-center justify-between border-t pt-3">
                      <div className="text-description truncate text-xs">
                        {invitation.inviter?.email ? (
                          <span>
                            Invited by{" "}
                            {invitation.inviter.first_name ||
                              invitation.inviter.username ||
                              invitation.inviter.email}
                          </span>
                        ) : (
                          <span className="text-zinc-400">
                            Awaiting acceptance
                          </span>
                        )}
                      </div>

                      {canRevoke ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={isRevoking}
                          leftIcon={
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          }
                          onClick={() => handleRevokeClick(invitation)}
                          className="font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Revoke
                        </Button>
                      ) : (
                        <span
                          className="text-description text-xs italic"
                          title="Only project Owner can revoke Admin invitations"
                        >
                          Owner only
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-border border-t bg-zinc-50/60 p-4">
          <div className="flex items-start gap-2 text-xs text-zinc-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <p>
              Invitations expire automatically after 7 days. Revoking an
              invitation invalidates the invite token immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingInvitationsDrawer;
