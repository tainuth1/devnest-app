"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Network,
  Grid,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

export interface ProjectCanvasProps {
  className?: string;
  children?: React.ReactNode;
}

export function ProjectCanvas({
  className = "",
  children,
}: ProjectCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and Zoom State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isGraphView, setIsGraphView] = useState(true);

  // Drag tracking ref
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Only drag with left mouse button (0) or middle click (1)
      if (e.button !== 0 && e.button !== 1) return;

      // Do not initiate drag if user clicked directly on an interactive button/control
      const target = e.target as HTMLElement;
      if (target.closest("button, a, input, select, textarea")) return;

      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      };

      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pan.x, pan.y]
  );

  // Pointer Move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !dragStartRef.current) return;

      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    },
    [isDragging]
  );

  // Pointer Up / Cancel
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDragging) {
        setIsDragging(false);
        dragStartRef.current = null;
        try {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Safe fallback if pointer wasn't captured
        }
      }
    },
    [isDragging]
  );

  // Wheel Panning & Pinch/Ctrl-Wheel Zooming
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      // Prevent page scrolling when interacting with canvas
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zooming mode
        const zoomDelta = -e.deltaY * 0.002;
        const newScale = Math.min(Math.max(scale + zoomDelta, 0.25), 3);

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Zoom toward mouse position
          const factor = newScale / scale;
          const newX = mouseX - (mouseX - pan.x) * factor;
          const newY = mouseY - (mouseY - pan.y) * factor;

          setScale(newScale);
          setPan({ x: newX, y: newY });
        } else {
          setScale(newScale);
        }
      } else {
        // Standard two-finger pan / mouse wheel scroll
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [scale, pan.x, pan.y]
  );

  // Fit view / reset position & zoom
  const handleFitView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setScale(1);
  }, []);

  // Zoom In / Out Buttons
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.15, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.15, 0.25));
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className={`border-border relative flex min-h-120 w-full flex-1 flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-2xs select-none lg:min-h-145 xl:min-h-160 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
    >
      {/* Subtle Dotted Background Grid - Movable & Panable */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          backgroundImage: showGrid
            ? "radial-gradient(circle, #e4e4e7 1.25px, transparent 1.25px)"
            : "none",
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          opacity: showGrid ? 1 : 0,
        }}
      />

      {/* Top-Right Canvas Toolbar Controls */}
      <div className="relative z-10 flex justify-end p-4">
        <div className="border-border flex items-center gap-1 rounded-lg border bg-white/90 p-1 shadow-2xs backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setIsGraphView((prev) => !prev)}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors ${
              isGraphView
                ? "bg-zinc-100 font-semibold text-zinc-900"
                : "text-muted hover:text-body hover:bg-zinc-100"
            }`}
            title="Graph View"
          >
            <Network className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowGrid((prev) => !prev)}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors ${
              showGrid
                ? "bg-zinc-100 font-semibold text-zinc-900"
                : "text-muted hover:text-body hover:bg-zinc-100"
            }`}
            title={showGrid ? "Hide Grid" : "Show Grid"}
          >
            <Grid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleFitView}
            className="text-muted hover:text-body flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-zinc-100"
            title="Fit View / Reset Pan"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom-Left Mini Zoom Pill Controls */}
      <div className="pointer-events-none relative z-10 flex items-center justify-between p-4">
        <div className="border-border pointer-events-auto flex items-center gap-1 rounded-lg border bg-white/90 p-1 shadow-2xs backdrop-blur-xs">
          <button
            type="button"
            onClick={handleZoomOut}
            className="text-muted hover:text-body flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:bg-zinc-100"
            title="Zoom Out"
          >
            <ZoomOut className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleFitView}
            className="cursor-pointer px-1 font-mono text-[11px] font-medium text-zinc-600 transition-colors hover:text-zinc-950"
            title="Reset to 100%"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="text-muted hover:text-body flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:bg-zinc-100"
            title="Zoom In"
          >
            <ZoomIn className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Scaled & Panned Viewport Container for future canvas nodes/elements */}
      <div
        className="pointer-events-none absolute inset-0 origin-top-left"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ProjectCanvas;
