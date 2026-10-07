"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/shared/utils/cn";
import { useToasts } from "./toast-store";
import { ToastItem } from "./toast-item";
import type { ToasterProps, ToastPosition } from "./toast-types";

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "top-5 left-5",
  "top-center": "top-5 left-1/2 -translate-x-1/2",
  "top-right": "top-5 right-6",
  "bottom-left": "bottom-5 left-5",
  "bottom-center": "bottom-5 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-5 right-6",
};

export function Toaster({
  position = "bottom-right",
  duration = 3500,
  maxVisible = 5,
  showProgress = false,
  className,
}: ToasterProps) {
  const toasts = useToasts();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  const limit = typeof maxVisible === "number" ? maxVisible : 5;
  const visibleToasts = toasts.slice(0, limit);

  return (
    <div
      aria-label="Notifications"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "pointer-events-none fixed z-9999",
        positionClasses[position],
        className
      )}
    >
      <div className="relative h-12 w-100 max-w-[calc(100vw-2rem)]">
        {visibleToasts.map((toastItem, index) => (
          <ToastItem
            key={toastItem.id}
            toast={toastItem}
            index={index}
            position={position}
            isHovered={isHovered}
            defaultDuration={duration}
            showProgress={showProgress}
          />
        ))}
      </div>
    </div>
  );
}
