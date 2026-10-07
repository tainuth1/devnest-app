"use client";

import React, { useState } from "react";
import { X, Sparkles, KeyRound, Database } from "lucide-react";
import { AVAILABLE_REGIONS } from "../../../shared/data/mock-data";
import {
  Project,
  ComputeTier,
  ProjectStatus,
  PROJECT_STATUSES,
} from "../types";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

function generateProjectCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("ap-northeast-1");
  const [tier, setTier] = useState<ComputeTier>("NANO");
  const [status, setStatus] = useState<ProjectStatus>("Not Started");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const selectedReg =
        AVAILABLE_REGIONS.find((r) => r.id === region) || AVAILABLE_REGIONS[0];

      const newProj: Project = {
        id: `proj_${Date.now()}`,
        name: name.trim(),
        ref: generateProjectCode(),
        region: selectedReg.id,
        regionName: selectedReg.name,
        tier: tier,
        status: status,
        order_index: 0,
        databaseVersion: "PostgreSQL 16.3",
        updatedAt: "Just now",
        createdAt: new Date().toISOString().split("T")[0],
      };

      onCreateProject(newProj);
      setIsSubmitting(false);
      setName("");
      setPassword("");
      setStatus("Not Started");
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-xs">
      <div className="border-border relative w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="border-border-subtle flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-heading text-base font-semibold">
                Create a new project
              </h2>
              <p className="text-description text-xs">
                Your project will have its own dedicated Postgres database
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-heading rounded-lg p-1.5 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Organization */}
          <div>
            <label className="text-body block text-xs font-medium">
              Organization
            </label>
            <div className="border-border text-body mt-1 flex items-center justify-between rounded-lg border bg-zinc-50/70 px-3 py-2 text-xs">
              <span className="font-medium">Personal (Free Tier)</span>
              <span className="text-muted text-[10px]">Default</span>
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label
              htmlFor="projectName"
              className="text-body block text-xs font-medium"
            >
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frontend Developer Portfolio"
              className="border-border text-heading placeholder:text-muted hover:border-border-hover focus:border-primary focus:ring-primary mt-1 block w-full rounded-lg border px-3 py-2 text-xs shadow-2xs focus:ring-1 focus:outline-none"
            />
          </div>

          {/* Database Password */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="dbPassword"
                className="text-body block text-xs font-medium"
              >
                Database Password
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <Sparkles className="h-3 w-3" />
                Generate password
              </button>
            </div>
            <div className="relative mt-1">
              <input
                id="dbPassword"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter or generate a strong password"
                className="border-border text-heading placeholder:text-muted hover:border-border-hover focus:border-primary focus:ring-primary block w-full rounded-lg border px-3 py-2 pr-10 text-xs shadow-2xs focus:ring-1 focus:outline-none"
              />
              <KeyRound className="text-muted absolute top-2.5 right-3 h-3.5 w-3.5" />
            </div>
          </div>

          {/* Region */}
          <div>
            <label
              htmlFor="regionSelect"
              className="text-body block text-xs font-medium"
            >
              Region
            </label>
            <select
              id="regionSelect"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border-border text-heading hover:border-border-hover focus:border-primary focus:ring-primary mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-2xs focus:ring-1 focus:outline-none"
            >
              {AVAILABLE_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id})
                </option>
              ))}
            </select>
            <p className="text-muted mt-1 text-[11px]">
              Select a region close to your users for minimal latency.
            </p>
          </div>

          {/* Initial Status */}
          <div>
            <label
              htmlFor="statusSelect"
              className="text-body block text-xs font-medium"
            >
              Initial Status
            </label>
            <select
              id="statusSelect"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="border-border text-heading hover:border-border-hover focus:border-primary focus:ring-primary mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-xs shadow-2xs focus:ring-1 focus:outline-none"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s.id} value={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Tier Notice & Selector */}
          <div className="border-border-subtle rounded-lg border bg-zinc-50 p-3 text-xs">
            <div className="flex items-center justify-between">
              <label
                htmlFor="tierSelect"
                className="text-heading font-semibold"
              >
                Compute Tier
              </label>
              <select
                id="tierSelect"
                value={tier}
                onChange={(e) => setTier(e.target.value as ComputeTier)}
                className="border-border text-body rounded border bg-white px-2 py-1 font-mono text-xs shadow-2xs"
              >
                <option value="NANO">NANO (Free)</option>
                <option value="MICRO">MICRO</option>
                <option value="SMALL">SMALL</option>
                <option value="MEDIUM">MEDIUM</option>
              </select>
            </div>
            <p className="text-description mt-1 text-[11px]">
              Includes 500 MB database space, 5 GB egress, and shared CPU.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="border-border-subtle flex items-center justify-end gap-2.5 border-t pt-3">
            <button
              type="button"
              onClick={onClose}
              className="text-body cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium shadow-2xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Provisioning...</span>
              ) : (
                <span>Create project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
