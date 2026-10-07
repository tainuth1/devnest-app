"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { LogOut } from "lucide-react";
import { Button } from "@/shared/components/ui";

export interface LeaveTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const LeaveTeamModal: React.FC<LeaveTeamModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (isLoading) return;
    if (backdropRef.current && cardRef.current) {
      gsap.killTweensOf([backdropRef.current, cardRef.current]);
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.1,
        ease: "power2.in",
      });
      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.97,
        y: -6,
        duration: 0.1,
        ease: "power2.in",
        onComplete: () => {
          onClose();
        },
      });
    } else {
      onClose();
    }
  }, [isLoading, onClose]);

  // Fast GSAP Entrance Animation
  useEffect(() => {
    if (isOpen && backdropRef.current && cardRef.current) {
      gsap.killTweensOf([backdropRef.current, cardRef.current]);
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.12, ease: "power2.out" }
      );
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.96, y: -8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.15, ease: "power3.out" }
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

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current && !isLoading) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
    >
      <div
        ref={cardRef}
        className="border-border w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <LogOut className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-heading text-base font-semibold">
              Leave Project
            </h3>
            <p className="text-description mt-0.5 text-xs">
              Are you sure you want to leave this project? You will lose access
              immediately.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            Leave team
          </Button>
        </div>
      </div>
    </div>
  );
};
