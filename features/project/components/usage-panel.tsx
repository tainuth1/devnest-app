"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { UsageMetric } from "../types";

interface UsagePanelProps {
  metrics: UsageMetric[];
  onUpgradeClick: () => void;
}

export const UsagePanel: React.FC<UsagePanelProps> = ({
  metrics,
  onUpgradeClick,
}) => {
  const [hoveredMetricId, setHoveredMetricId] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Panel Header */}
      <div className="flex items-start justify-between pb-4">
        <div>
          <h2 className="text-heading text-sm font-semibold tracking-tight">
            Free plan usage
          </h2>
          <p className="text-description mt-0.5 text-xs">
            Current billing cycle
          </p>
        </div>

        {/* Upgrade to Pro Button */}
        <button
          type="button"
          onClick={onUpgradeClick}
          className="group border-border text-heading hover:border-border-hover inline-flex cursor-pointer items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs font-medium shadow-2xs transition-all hover:bg-zinc-50 focus:outline-none"
        >
          <span>Upgrade to Pro</span>
          <ArrowUpRight className="text-muted h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Metrics List */}
      <div className="divide-border-subtle space-y-0 divide-y text-xs">
        {metrics.map((metric) => {
          const isHovered = hoveredMetricId === metric.id;
          const radius = 6;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset =
            circumference - (metric.percentage / 100) * circumference;

          return (
            <div
              key={metric.id}
              onMouseEnter={() => setHoveredMetricId(metric.id)}
              onMouseLeave={() => setHoveredMetricId(null)}
              className="group flex flex-col py-2.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Metric Name & Circle Indicator */}
                <div className="flex items-center gap-2.5">
                  {/* Circular Indicator Ring matching screenshot */}
                  <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                    <svg className="h-4 w-4 -rotate-90" viewBox="0 0 16 16">
                      {/* Background Track */}
                      <circle
                        cx="8"
                        cy="8"
                        r={radius}
                        className="stroke-border fill-none"
                        strokeWidth="1.75"
                      />
                      {/* Filled Progress */}
                      {metric.percentage > 0 && (
                        <circle
                          cx="8"
                          cy="8"
                          r={radius}
                          className="fill-none stroke-emerald-600 transition-all duration-500"
                          strokeWidth="1.75"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  </div>

                  <span className="text-body group-hover:text-heading text-xs font-normal">
                    {metric.label}
                  </span>
                </div>

                {/* Values (e.g. 0.00 / 5 GB or 27 / 500 MB) */}
                <div className="text-body flex items-center gap-1.5 font-mono text-xs tabular-nums">
                  <span
                    className={
                      metric.percentage > 0
                        ? "text-heading font-medium"
                        : "text-body"
                    }
                  >
                    {metric.formattedUsed}
                  </span>
                  <span className="text-muted">/</span>
                  <span className="text-description">
                    {metric.formattedLimit}
                  </span>
                </div>
              </div>

              {/* Subtle hover detail tooltip/progress bar */}
              {isHovered && metric.percentage > 0 && (
                <div className="text-description mt-2 flex items-center justify-between gap-2 rounded bg-zinc-50 px-2 py-1 text-[11px]">
                  <span>{metric.description}</span>
                  <span className="font-semibold text-emerald-600">
                    {metric.percentage}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helpful billing hint */}
      <div className="border-border-subtle text-muted mt-4 flex items-center justify-between border-t pt-3 text-[11px]">
        <span>Resets in 27 days</span>
        <button
          type="button"
          onClick={onUpgradeClick}
          className="cursor-pointer text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          View detailed breakdown
        </button>
      </div>
    </div>
  );
};
