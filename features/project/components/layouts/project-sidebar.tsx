"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Workflow,
  Database,
  FileText,
  History,
  HardDriveDownload,
  Sparkles,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface NavItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  pathSuffix?: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "ai" | "mcp";
  hasNotification?: boolean;
}

export interface NavGroup {
  items: NavItem[];
}

// Custom Panel Toggle Icon for the bottom collapse / pin control
const PanelToggleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2.5" />
    <path d="M9 3v18" strokeDasharray="2.5 2" />
  </svg>
);

// Custom MCP Icon matching public/icons/mcp.svg
export const McpIcon = ({
  className,
  strokeWidth = 1.75,
}: {
  className?: string;
  strokeWidth?: number;
}) => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth ? (strokeWidth / 1.75) * 12 : 12}
    strokeLinecap="round"
    className={className}
  >
    <path d="M18 84.8528L85.8822 16.9706C95.2548 7.59798 110.451 7.59798 119.823 16.9706V16.9706C129.196 26.3431 129.196 41.5391 119.823 50.9117L68.5581 102.177" />
    <path d="M69.2652 101.47L119.823 50.9117C129.196 41.5391 144.392 41.5391 153.765 50.9117L154.118 51.2652C163.491 60.6378 163.491 75.8338 154.118 85.2063L92.7248 146.6C89.6006 149.724 89.6006 154.789 92.7248 157.913L105.331 170.52" />
    <path d="M102.853 33.9411L52.6482 84.1457C43.2756 93.5183 43.2756 108.714 52.6482 118.087V118.087C62.0208 127.459 77.2167 127.459 86.5893 118.087L136.794 67.8822" />
  </svg>
);

// Navigation groups strictly aligned with Dev Nest analysis specifications
// Clean divider-separated layout without section headings (matching original design)
export const NAV_GROUPS: NavGroup[] = [
  // Group 1: Core Planning Engines
  {
    items: [
      {
        id: "overview",
        name: "Project Overview",
        icon: LayoutDashboard,
        pathSuffix: "",
      },
      {
        id: "flows",
        name: "System Flow",
        icon: Workflow,
        pathSuffix: "/flows",
      },
      {
        id: "schemas",
        name: "Database Schema",
        icon: Database,
        pathSuffix: "/schemas",
      },
      {
        id: "documents",
        name: "Documents & Specs",
        icon: FileText,
        pathSuffix: "/documents",
      },
    ],
  },
  // Group 2: Reliability & History
  {
    items: [
      {
        id: "versions",
        name: "Version History",
        icon: History,
        pathSuffix: "/versions",
      },
      {
        id: "backups",
        name: "Backups & Restore",
        icon: HardDriveDownload,
        pathSuffix: "/backups",
      },
    ],
  },
  // Group 3: Intelligence & Integrations
  {
    items: [
      {
        id: "ai-assistant",
        name: "AI Assistant",
        icon: Sparkles,
        pathSuffix: "/ai-assistant",
        badge: "AI",
        badgeVariant: "ai",
      },
      {
        id: "mcp",
        name: "MCP & API Tools",
        icon: McpIcon,
        pathSuffix: "/mcp",
        badge: "MCP",
        badgeVariant: "mcp",
      },
    ],
  },
  // Group 4: Collaboration & Settings
  {
    items: [
      {
        id: "team",
        name: "Team & Roles",
        icon: Users,
        pathSuffix: "/team",
      },
      {
        id: "settings",
        name: "Project Settings",
        icon: Settings,
        pathSuffix: "/settings",
      },
    ],
  },
];

const getBadgeStyles = (variant?: NavItem["badgeVariant"]) => {
  switch (variant) {
    case "ai":
      return "border-purple-300 bg-purple-50 text-purple-700";
    case "mcp":
      return "border-sky-300 bg-sky-50 text-sky-700";
    case "success":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    default:
      return "border-emerald-500/30 bg-emerald-50 text-emerald-600";
  }
};

export const ProjectSidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const params = useParams();
  const pathname = usePathname();

  const projectCode =
    (params?.project_code as string) ||
    (pathname?.startsWith("/workspace/projects/")
      ? pathname.split("/workspace/projects/")[1]?.split("/")[0]?.split("?")[0]
      : "") ||
    "proj_1";

  const basePath = `/workspace/projects/${projectCode}`;

  // By default, the sidebar is closed. Hover opens it. User can also toggle pin to lock it open.
  const isOpen = isPinned || isHovered;

  const isItemActive = (item: NavItem) => {
    const itemPath = `${basePath}${item.pathSuffix || ""}`;
    if (!item.pathSuffix) {
      return pathname === basePath;
    }
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  const getItemHref = (item: NavItem) => {
    return `${basePath}${item.pathSuffix || ""}`;
  };

  return (
    <>
      {/* Layout Spacer to maintain content position without jumping */}
      <div
        className={cn(
          "shrink-0 transition-[width] duration-200 ease-in-out select-none",
          isPinned ? "w-56" : "w-12.5"
        )}
        aria-hidden="true"
      />

      {/* Floating / Expanding Sidebar Rail */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed top-12 bottom-0 left-0 z-30 flex flex-col border-r border-zinc-200/90 bg-white transition-[width,box-shadow] duration-200 ease-in-out select-none",
          isOpen ? "w-56" : "w-13.5"
        )}
      >
        {/* Navigation Items Scroll Area */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto py-2.5">
          <nav className="flex flex-col gap-0.5 px-1.5">
            {NAV_GROUPS.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                {groupIdx > 0 && (
                  <div className="mx-1 my-1.5 border-t border-zinc-200/80" />
                )}

                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = isItemActive(item);
                    const IconComponent = item.icon;

                    return (
                      <Link
                        key={item.id}
                        href={getItemHref(item)}
                        title={!isOpen ? item.name : undefined}
                        className={cn(
                          "group relative flex h-9 items-center rounded-lg px-2.5 transition-colors focus:outline-none",
                          active
                            ? "bg-zinc-100 font-medium text-zinc-900"
                            : "text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900"
                        )}
                      >
                        {/* Icon Container (fixed width to prevent any movement) */}
                        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                          <IconComponent
                            className={cn(
                              "h-4.5 w-4.5 transition-colors",
                              active
                                ? "text-zinc-900"
                                : "text-zinc-600 group-hover:text-zinc-900"
                            )}
                            strokeWidth={1.75}
                          />

                          {/* Notification Dot */}
                          {item.hasNotification && (
                            <span
                              className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"
                              aria-label="Notification alert"
                            />
                          )}
                        </div>

                        {/* Label & Badges (smoothly revealed on expansion) */}
                        <div
                          className={cn(
                            "flex flex-1 items-center justify-between overflow-hidden transition-all duration-150",
                            isOpen
                              ? "ml-3 max-w-40 opacity-100"
                              : "pointer-events-none max-w-0 opacity-0"
                          )}
                        >
                          <span className="truncate text-xs tracking-normal text-zinc-800">
                            {item.name}
                          </span>

                          {/* Pill Badge */}
                          {item.badge && (
                            <span
                              className={cn(
                                "ml-2 shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase",
                                getBadgeStyles(item.badgeVariant)
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Bottom Pinned Action: Collapse / Pin Toggle Button */}
        <div className="border-t border-zinc-200/80 p-1.5">
          <button
            type="button"
            onClick={() => setIsPinned((prev) => !prev)}
            title={
              isPinned ? "Unpin sidebar (auto-collapse)" : "Pin sidebar open"
            }
            className={cn(
              "group flex h-9 w-full items-center rounded-lg px-2.5 transition-colors focus:outline-none",
              isPinned
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900"
            )}
          >
            {/* Toggle Icon */}
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              <PanelToggleIcon className="h-4.5 w-4.5 text-zinc-600 transition-colors group-hover:text-zinc-900" />
            </div>

            {/* Bottom Label when expanded */}
            <div
              className={cn(
                "flex flex-1 items-center justify-between overflow-hidden transition-all duration-150",
                isOpen
                  ? "ml-3 max-w-40 opacity-100"
                  : "pointer-events-none max-w-0 opacity-0"
              )}
            >
              <span className="truncate text-xs text-zinc-600">
                {isPinned ? "Pinned open" : "Collapse"}
              </span>
              <span className="text-[10px] text-zinc-400">
                {isPinned ? "Click to unpin" : "Click to pin"}
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProjectSidebar;
