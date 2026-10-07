"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Workflow,
  Plus,
  Download,
  Share2,
  Lock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
} from "lucide-react";
import { Button } from "@/shared/components/ui";

const SystemFlowPage = () => {
  const params = useParams();
  const projectCode = (params?.project_code as string) || "proj_1";
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-3rem)] bg-zinc-50/50">
      {/* Top Action Bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Workflow className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">
                System Flow Designer
              </h1>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.2 text-[10px] font-semibold text-indigo-700">
                Draw.io Engine
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Architecture diagrams, sequence charts & microservice topologies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs text-zinc-600">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 10, 50))}
              className="rounded p-1 hover:bg-white hover:text-zinc-900 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 10, 200))}
              className="rounded p-1 hover:bg-white hover:text-zinc-900 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5 text-zinc-500" />}>
            Export XML / SVG
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            New Diagram
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 p-6 overflow-hidden flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl rounded-2xl border-2 border-dashed border-zinc-200 bg-white/70 p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Layers className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-900">
            Interactive Draw.io Canvas
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
            Create multi-page architecture workflows, cloud service topologies, and sequence diagrams with optimistic version locking and auto-sync.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Create Flow Canvas
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Lock className="h-3.5 w-3.5 text-zinc-500" />}>
              Lock & Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemFlowPage;
