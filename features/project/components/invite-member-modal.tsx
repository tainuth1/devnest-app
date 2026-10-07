"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { X, UserPlus, Mail } from "lucide-react";
import { Button, Input } from "@/shared/components/ui";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string) => Promise<void>;
  currentUserRole?: string;
}

interface InviteFormData {
  email: string;
  role: string;
}

const ROLES = [
  {
    id: "EDITOR",
    label: "Editor",
    description: "Can view, edit flows, schemas, and documents.",
  },
  {
    id: "VIEWER",
    label: "Viewer",
    description: "Read-only access to view artifacts and exports.",
  },
  {
    id: "ADMIN",
    label: "Admin",
    description: "Full operational control, manage settings and team members.",
  },
];

const INITIAL_FORM_DATA: InviteFormData = {
  email: "",
  role: "EDITOR",
};

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  currentUserRole,
}) => {
  const isAdminOnly = currentUserRole?.toUpperCase() === "ADMIN";
  const availableRoles = isAdminOnly
    ? ROLES.filter((r) => r.id !== "ADMIN")
    : ROLES;

  const [formData, setFormData] = useState<InviteFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
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
          setFormData(INITIAL_FORM_DATA);
          setError(null);
          onClose();
        },
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
      setError(null);
      onClose();
    }
  }, [onClose]);

  // GSAP Entrance animation
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

      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter an email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onInvite(cleanEmail, formData.role);
      handleClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send invitation.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current && !isSubmitting) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
    >
      <div
        ref={cardRef}
        className="border-border w-full max-w-md rounded-xl border bg-white shadow-xl"
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-heading text-base font-semibold">
                Invite Team Member
              </h3>
              <p className="text-description text-xs">
                Send an invitation email to collaborate on this project
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-heading rounded-lg p-1.5 transition-colors hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <Input
              ref={emailInputRef}
              name="email"
              label="Email Address"
              type="email"
              size="md"
              required
              placeholder="colleague@example.com"
              value={formData.email}
              onChange={handleInputChange}
              leftIcon={<Mail className="text-muted h-4 w-4" />}
            />
          </div>

          <div>
            <label className="text-heading mb-1.5 block text-xs font-medium">
              Project Role
            </label>
            <div className="space-y-2">
              {availableRoles.map((r) => {
                const isSelected = formData.role === r.id;
                return (
                  <label
                    key={r.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5 text-heading"
                        : "border-border text-body hover:bg-zinc-50/70"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={isSelected}
                      onChange={handleInputChange}
                      className="text-primary focus:ring-primary border-border mt-0.5 h-4 w-4"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-heading text-xs font-semibold">
                        {r.label}
                      </div>
                      <div className="text-description mt-0.5 text-xs leading-normal">
                        {r.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-border flex items-center justify-end gap-2.5 border-t pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              Send invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
