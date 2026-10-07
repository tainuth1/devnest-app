"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { X, Send, Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [feedbackCategory, setFeedbackCategory] = useState<
    "feedback" | "issue" | "feature"
  >("feedback");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (backdropRef.current && cardRef.current) {
      gsap.killTweensOf([backdropRef.current, cardRef.current]);
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.15,
        ease: "power2.in",
      });
      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.96,
        y: -10,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          setFeedbackSubmitted(false);
          setFeedbackText("");
          onClose();
        },
      });
    } else {
      setFeedbackSubmitted(false);
      setFeedbackText("");
      onClose();
    }
  }, [onClose]);

  // GSAP Entrance animation on modal container
  useEffect(() => {
    if (isOpen && backdropRef.current && cardRef.current) {
      gsap.killTweensOf([backdropRef.current, cardRef.current]);
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" }
      );
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.94, y: -16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.24, ease: "power3.out" }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 1400);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
    >
      <div
        ref={cardRef}
        className="border-border relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-2xl"
      >
        <div className="border-border-subtle flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-heading text-sm font-semibold">
              Share Your Feedback
            </h3>
            <p className="text-description mt-0.5 text-xs">
              Help us refine and improve the DevNest experience.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-heading cursor-pointer rounded-lg p-1 transition-colors hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {feedbackSubmitted ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-5 w-5" />
            </div>
            <h4 className="text-heading text-sm font-semibold">Thank You!</h4>
            <p className="text-description text-xs">
              Your feedback has been received and noted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {/* Category Pills */}
            <div className="flex items-center gap-2">
              {(
                [
                  { id: "feedback", label: "General Feedback" },
                  { id: "feature", label: "Feature Idea" },
                  { id: "issue", label: "Bug Report" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFeedbackCategory(cat.id)}
                  className={cn(
                    "cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    feedbackCategory === cat.id
                      ? "bg-zinc-900 text-white"
                      : "text-body bg-zinc-100 hover:bg-zinc-200"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div>
              <textarea
                rows={4}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you love or what we could improve..."
                className="border-border text-heading placeholder:text-muted hover:border-border-hover focus:border-border-hover w-full resize-none rounded-xl border p-3 text-xs transition-colors focus:outline-none"
              />
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="text-body cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
