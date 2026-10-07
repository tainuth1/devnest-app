"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Settings,
  Share2,
  AlertTriangle,
  Save,
  KeyRound,
  ArrowRightLeft,
  Trash2,
} from "lucide-react";
import { Button, Input, toast } from "@/shared/components/ui";

const ProjectSettingsPage = () => {
  const params = useParams();
  const projectCode = (params?.project_code as string) || "proj_1";
  const [projectName, setProjectName] = useState("TAI NUTH - Portfolio");
  const [description, setDescription] = useState(
    "Pre-implementation technical analysis, Draw.io architecture flow, and DrawDB relational models."
  );

  const handleSave = () => {
    toast.success("Project settings updated successfully");
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-1 flex-col bg-zinc-50/50">
      {/* Top Action Bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
            <Settings className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">
                Project Settings
              </h1>
            </div>
            <p className="text-[11px] text-zinc-500">
              General configuration, blueprint templates, and ownership
              administration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            leftIcon={<Save className="h-3.5 w-3.5" />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 overflow-y-auto p-6">
        {/* General Details */}
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
          <h3 className="text-sm font-semibold text-zinc-900">
            General Information
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-700">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Template Publishing */}
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Publish as Blueprint Template
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Share this project layout (diagrams, schemas & markdown specs)
                with your team or publish to the community template catalog.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Share2 className="h-3.5 w-3.5 text-zinc-500" />}
            >
              Publish Template
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50/20 p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4.5 w-4.5" />
            <h3 className="text-sm font-semibold">Danger Zone</h3>
          </div>

          <div className="flex items-center justify-between border-t border-red-100 pt-3">
            <div>
              <h4 className="text-xs font-medium text-zinc-900">
                Transfer Ownership
              </h4>
              <p className="text-[11px] text-zinc-500">
                2-step handshake protocol: transfer project ownership to another
                active member.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={
                <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-500" />
              }
            >
              Transfer
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-red-100 pt-3">
            <div>
              <h4 className="text-xs font-medium text-red-700">
                Delete Project
              </h4>
              <p className="text-[11px] text-zinc-500">
                Permanently purge this project, diagrams, schemas and documents.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsPage;
