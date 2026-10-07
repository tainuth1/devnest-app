"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { Check, X, AlertTriangle, Info, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { ToastData, ToastPosition } from "./toast-types";
import { toast } from "./toast-store";

interface ToastItemProps {
  toast: ToastData;
  index: number;
  position: ToastPosition;
  isHovered: boolean;
  defaultDuration?: number;
  showProgress?: boolean;
}

const itemAnchorClasses: Record<ToastPosition, string> = {
  "top-left": "top-0 left-0",
  "top-center": "top-0 left-1/2",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-center": "bottom-0 left-1/2",
  "bottom-right": "bottom-0 right-0",
};

export function ToastItem({
  toast: item,
  index,
  position,
  isHovered,
  defaultDuration = 3500,
  showProgress = false,
}: ToastItemProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);

  const duration = item.duration ?? defaultDuration;
  const isInfinite = duration === 0 || duration === Infinity;

  const remainingRef = useRef<number>(duration);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isBottom = position.startsWith("bottom");
  const isCenter = position.includes("center");
  const isRight = position.includes("right");

  // Dismiss with smooth GSAP exit animation
  const handleDismiss = useCallback(() => {
    if (!elRef.current) {
      toast.remove(item.id);
      return;
    }

    item.onDismiss?.(item.id);

    gsap.killTweensOf(elRef.current);
    gsap.to(elRef.current, {
      opacity: 0,
      scale: 0.85,
      x: isRight ? 40 : position.includes("left") ? -40 : 0,
      y: isBottom ? 12 : -12,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        toast.remove(item.id);
      },
    });
  }, [item, isBottom, isRight, position]);

  // Handle external dismiss triggered via toast.dismiss()
  useEffect(() => {
    if (item.isDismissing) {
      const dismissTimer = setTimeout(() => {
        handleDismiss();
      }, 0);
      return () => clearTimeout(dismissTimer);
    }
  }, [item.isDismissing, handleDismiss]);

  // Pause / resume auto-dismiss countdown based on hover state
  useEffect(() => {
    if (isInfinite) return;

    if (!isHovered) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        item.onAutoClose?.(item.id);
        handleDismiss();
      }, remainingRef.current);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        const elapsed = Date.now() - startTimeRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered, isInfinite, handleDismiss, item]);

  // GSAP Entrance & Stacking Animation
  useEffect(() => {
    if (!elRef.current) return;

    const xPercent = isCenter ? -50 : 0;
    const transformOrigin = isBottom
      ? isRight
        ? "bottom right"
        : isCenter
          ? "bottom center"
          : "bottom left"
      : isRight
        ? "top right"
        : isCenter
          ? "top center"
          : "top left";

    // Target values when hovered (expanded listing) vs collapsed (stacking)
    let targetY = 0;
    let targetScale = 1;
    let targetOpacity = 1;

    if (isHovered) {
      // Expanded into clean listing
      targetY = isBottom ? -(index * 54) : index * 54;
      targetScale = 1;
      targetOpacity = index < 5 ? 1 : 0;
    } else {
      // Stacked deck with newest on top
      if (index === 0) {
        targetY = 0;
        targetScale = 1;
        targetOpacity = 1;
      } else if (index === 1) {
        targetY = isBottom ? -12 : 12;
        targetScale = 0.94;
        targetOpacity = 0.9;
      } else if (index === 2) {
        targetY = isBottom ? -24 : 24;
        targetScale = 0.88;
        targetOpacity = 0.75;
      } else {
        targetY = isBottom ? -32 : 32;
        targetScale = 0.82;
        targetOpacity = 0;
      }
    }

    if (!isMountedRef.current) {
      // Initial mount spring entrance animation
      isMountedRef.current = true;
      gsap.fromTo(
        elRef.current,
        {
          opacity: 0,
          scale: 0.9,
          y: isBottom ? 30 : -30,
          xPercent,
          transformOrigin,
        },
        {
          opacity: targetOpacity,
          scale: targetScale,
          y: targetY,
          xPercent,
          transformOrigin,
          duration: 0.38,
          ease: "back.out(1.15)",
        }
      );
    } else {
      // Smooth GSAP transition between stacking and listing
      gsap.to(elRef.current, {
        opacity: targetOpacity,
        scale: targetScale,
        y: targetY,
        xPercent,
        transformOrigin,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [index, isHovered, isBottom, isCenter, isRight]);

  // Solid circular icon badge (white theme)
  const renderIcon = () => {
    if (item.icon) {
      return (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          {item.icon}
        </div>
      );
    }

    switch (item.type) {
      case "success":
      default:
        return (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <Check className="h-3 w-3 stroke-3" />
          </div>
        );
      case "error":
        return (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
            <X className="h-3 w-3 stroke-3" />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <AlertTriangle className="h-3 w-3 stroke-[2.5]" />
          </div>
        );
      case "info":
        return (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <Info className="h-3 w-3 stroke-[2.5]" />
          </div>
        );
      case "loading":
        return (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center">
            <Loader2 className="h-4.5 w-4.5 animate-spin text-zinc-900" />
          </div>
        );
    }
  };

  const isClickable = isHovered || index === 0;

  return (
    <div
      ref={elRef}
      role="status"
      aria-live="polite"
      style={{
        zIndex: 50 - index,
      }}
      className={cn(
        "absolute flex w-90 max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 select-none sm:py-3",
        "shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)]",
        itemAnchorClasses[position],
        isClickable ? "pointer-events-auto" : "pointer-events-none",
        item.className
      )}
    >
      {/* Icon Badge */}
      {renderIcon()}

      {/* Title only */}
      <span className="min-w-0 flex-1 truncate text-[13.5px] leading-snug font-medium tracking-tight text-zinc-900">
        {item.title}
      </span>

      {/* Action Button */}
      {item.action && (
        <button
          type="button"
          onClick={(e) => {
            item.action?.onClick(e);
            handleDismiss();
          }}
          className="ml-1 rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 active:scale-95"
        >
          {item.action.label}
        </button>
      )}

      {/* Optional Close Button */}
      {item.closable && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close toast"
          className="ml-1 rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Progress Bar (if explicitly enabled) */}
      {showProgress && !isInfinite && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-zinc-100">
          <div
            className="h-full origin-left bg-black transition-all"
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
              animationPlayState: isHovered ? "paused" : "running",
            }}
          />
        </div>
      )}
    </div>
  );
}
