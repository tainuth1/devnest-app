"use client";

import React from "react";
import { X, Check, Zap } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmUpgrade?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onConfirmUpgrade,
}) => {
  if (!isOpen) return null;

  const features = [
    "No project pausing - Keep all databases 100% active",
    "8 GB Database space included (scalable up to terabytes)",
    "250 GB Egress transfer included each month",
    "100,000 Monthly Active Users included",
    "100 GB File Storage with resumable uploads",
    "Daily automatic database backups retained for 7 days",
    "7-day log retention for API, functions, and database queries",
    "Email and community support with dedicated SLA",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-xs">
      <div className="border-border relative w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-heading absolute top-4 right-4 rounded-lg p-1.5 hover:bg-zinc-100"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Badge & Title */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <Zap className="h-3.5 w-3.5 text-emerald-600" />
          Pro Plan
        </div>

        <h2 className="text-heading mt-3 text-lg font-bold">
          Supercharge your workspace
        </h2>
        <p className="text-description mt-1 text-xs">
          Scale effortlessly without project pausing, plus increased resource
          limits.
        </p>

        {/* Price Card */}
        <div className="border-border mt-4 rounded-xl border bg-zinc-50/70 p-4">
          <div className="flex items-baseline gap-1">
            <span className="text-heading text-2xl font-extrabold">$25</span>
            <span className="text-description text-xs">
              / month per organization
            </span>
          </div>
          <p className="text-description mt-1 text-[11px]">
            Includes $10 compute credits and usage-based scaling beyond limits.
          </p>
        </div>

        {/* Feature List */}
        <div className="text-body mt-4 space-y-2.5 text-xs">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border-border text-body hover:border-border-hover flex-1 cursor-pointer rounded-lg border bg-white py-2 text-xs font-medium hover:bg-zinc-50"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmUpgrade?.();
              onClose();
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 cursor-pointer rounded-lg py-2 text-xs font-medium shadow-2xs transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
};
