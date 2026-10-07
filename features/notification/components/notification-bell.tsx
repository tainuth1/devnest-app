"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { gsap } from "gsap";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationPopover } from "./notification-popover";
import { cn } from "@/shared/utils/cn";

export interface NotificationBellProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === "boolean";
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const bellContainerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    unreadCount,
    isLoading,
    activeFilter,
    setActiveFilter,
    filteredNotifications,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    acceptInvitation,
    declineInvitation,
    isActionLoading,
  } = useNotifications({ pollIntervalMs: 20000 });

  const handleToggle = () => {
    if (isControlled && controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const handleClose = useCallback(() => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [isControlled, controlledOnClose]);

  // Refetch list when popover is opened
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // GSAP Entrance Animation
  useEffect(() => {
    if (isOpen && popoverRef.current) {
      gsap.killTweensOf(popoverRef.current);
      gsap.fromTo(
        popoverRef.current,
        {
          opacity: 0,
          scale: 0.95,
          y: -6,
          transformOrigin: "top right",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.18,
          ease: "power2.out",
        }
      );
    }
  }, [isOpen]);

  // Click-Outside Listener (if not fully controlled externally)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        bellContainerRef.current &&
        !bellContainerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClose]);

  return (
    <div className={cn("relative", className)} ref={bellContainerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="User notifications"
        className={cn(
          "border-border text-body hover:border-border-hover hover:text-heading hover:bg-border-subtle relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition-all focus:outline-none",
          isOpen && "border-border-hover text-heading bg-border-subtle"
        )}
      >
        <Bell className="h-3.5 w-3.5 stroke-[1.75]" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="animate-in zoom-in-50 bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold shadow-2xs duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <NotificationPopover
          ref={popoverRef}
          notifications={filteredNotifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onAcceptInvite={acceptInvitation}
          onDeclineInvite={declineInvitation}
          isActionLoading={isActionLoading}
          onClose={handleClose}
        />
      )}
    </div>
  );
};
