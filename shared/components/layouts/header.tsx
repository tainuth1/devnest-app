"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useParams } from "next/navigation";
import { gsap } from "gsap";
import {
  Search,
  CircleHelp,
  Lightbulb,
  ExternalLink,
  LogOut,
  FolderGit2,
  BookOpen,
  Layers,
  Boxes,
  ChevronsUpDown,
  Check,
  Plus,
} from "lucide-react";
import { useAuth } from "@/features/authentication";
import { cn } from "@/shared/utils/cn";
import { CommandPalette, FeedbackModal } from "../ui";
import { ProjectsService } from "@/features/project/services/project.service";
import { INITIAL_PROJECTS } from "@/shared/data/mock-data";
import type { Project } from "@/features/project/types";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  className?: string;
  projectCode?: string;
  isProjectDetail?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumbs,
  title = "Workspace",
  className,
  projectCode,
  isProjectDetail,
}) => {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  // Popover / Modal states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Project Switcher Detection & State
  const pathname = usePathname();
  const params = useParams();

  const routeProjectCode = params?.project_code as string | undefined;
  const rawProjectCode =
    projectCode ||
    routeProjectCode ||
    (pathname?.startsWith("/workspace/projects/") &&
    pathname !== "/workspace/projects/new" &&
    pathname !== "/workspace/projects"
      ? pathname.split("/workspace/projects/")[1]?.split("/")[0]
      : undefined);

  const isProjectDetailPage = Boolean(
    isProjectDetail || (rawProjectCode && rawProjectCode !== "new")
  );

  const [projectsList, setProjectsList] = useState<Project[]>(INITIAL_PROJECTS);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");

  const projectMenuRef = useRef<HTMLDivElement>(null);
  const projectMenuDropdownRef = useRef<HTMLDivElement>(null);
  const projectSearchInputRef = useRef<HTMLInputElement>(null);

  // Container refs for click-outside
  const helpRef = useRef<HTMLDivElement>(null);
  const whatsNewRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Animation element refs (only dropdown containers)
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const whatsNewMenuRef = useRef<HTMLDivElement>(null);
  const userMenuDropdownRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------
  // GSAP Animated Handlers for Dropdowns
  // -------------------------------------------------------------
  const closeHelp = useCallback(() => {
    if (helpMenuRef.current) {
      gsap.killTweensOf(helpMenuRef.current);
      gsap.to(helpMenuRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -6,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => setIsHelpOpen(false),
      });
    } else {
      setIsHelpOpen(false);
    }
  }, []);

  const openHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const closeWhatsNew = useCallback(() => {
    if (whatsNewMenuRef.current) {
      gsap.killTweensOf(whatsNewMenuRef.current);
      gsap.to(whatsNewMenuRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -6,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => setIsWhatsNewOpen(false),
      });
    } else {
      setIsWhatsNewOpen(false);
    }
  }, []);

  const openWhatsNew = useCallback(() => {
    setIsWhatsNewOpen(true);
  }, []);

  const closeUserMenu = useCallback(() => {
    if (userMenuDropdownRef.current) {
      gsap.killTweensOf(userMenuDropdownRef.current);
      gsap.to(userMenuDropdownRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -6,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => setIsUserMenuOpen(false),
      });
    } else {
      setIsUserMenuOpen(false);
    }
  }, []);

  const openUserMenu = useCallback(() => {
    setIsUserMenuOpen(true);
  }, []);

  const closeProjectMenu = useCallback(() => {
    if (projectMenuDropdownRef.current) {
      gsap.killTweensOf(projectMenuDropdownRef.current);
      gsap.to(projectMenuDropdownRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -6,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => setIsProjectMenuOpen(false),
      });
    } else {
      setIsProjectMenuOpen(false);
    }
  }, []);

  const openProjectMenu = useCallback(() => {
    setIsProjectMenuOpen(true);
  }, []);

  // Fetch project list
  useEffect(() => {
    let isCancelled = false;
    ProjectsService.getProjects()
      .then((res) => {
        if (!isCancelled && res.items && res.items.length > 0) {
          setProjectsList(res.items);
        }
      })
      .catch(() => {
        // Fallback to INITIAL_PROJECTS
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  const currentProject = useMemo(() => {
    if (!rawProjectCode) return projectsList[0] || INITIAL_PROJECTS[0];
    const foundInList = projectsList.find(
      (p) =>
        (Boolean(p.id) && p.id === rawProjectCode) ||
        (Boolean(p.project_code) && p.project_code === rawProjectCode) ||
        (Boolean(p.ref) && p.ref === rawProjectCode)
    );
    if (foundInList) return foundInList;

    const foundInMock = INITIAL_PROJECTS.find(
      (p) =>
        (Boolean(p.id) && p.id === rawProjectCode) ||
        (Boolean(p.project_code) && p.project_code === rawProjectCode) ||
        (Boolean(p.ref) && p.ref === rawProjectCode)
    );
    if (foundInMock) return foundInMock;

    return {
      id: rawProjectCode,
      project_code: rawProjectCode,
      name:
        rawProjectCode === "proj_1" ? "TAI NUTH - Portfolio" : rawProjectCode,
      ref: rawProjectCode,
      tier: "FREE",
      status: "In Progress" as const,
      order_index: 0,
    };
  }, [projectsList, rawProjectCode]);

  const filteredProjects = useMemo(() => {
    if (!projectSearchQuery.trim()) return projectsList;
    const q = projectSearchQuery.toLowerCase();
    return projectsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.ref?.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [projectsList, projectSearchQuery]);

  const handleSwitchProject = (proj: Project) => {
    closeProjectMenu();
    router.push(
      `/workspace/projects/${proj.project_code || proj.ref || proj.id}`
    );
  };

  // GSAP Entrance: Project Switcher Dropdown
  useEffect(() => {
    if (isProjectMenuOpen && projectMenuDropdownRef.current) {
      gsap.killTweensOf(projectMenuDropdownRef.current);
      gsap.fromTo(
        projectMenuDropdownRef.current,
        {
          opacity: 0,
          scale: 0.95,
          y: -6,
          transformOrigin: "top left",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.2,
          ease: "power2.out",
        }
      );
      setTimeout(() => {
        projectSearchInputRef.current?.focus();
      }, 50);
    } else {
      setProjectSearchQuery("");
    }
  }, [isProjectMenuOpen]);

  // -------------------------------------------------------------
  // Keyboard Shortcuts (Cmd/Ctrl + K, Escape)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        if (isProjectMenuOpen) closeProjectMenu();
        if (isHelpOpen) closeHelp();
        if (isWhatsNewOpen) closeWhatsNew();
        if (isUserMenuOpen) closeUserMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isProjectMenuOpen,
    isHelpOpen,
    isWhatsNewOpen,
    isUserMenuOpen,
    closeProjectMenu,
    closeHelp,
    closeWhatsNew,
    closeUserMenu,
  ]);

  // -------------------------------------------------------------
  // Click-Outside Listener for Dropdowns
  // -------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        isProjectMenuOpen &&
        projectMenuRef.current &&
        !projectMenuRef.current.contains(target)
      ) {
        closeProjectMenu();
      }
      if (isHelpOpen && helpRef.current && !helpRef.current.contains(target)) {
        closeHelp();
      }
      if (
        isWhatsNewOpen &&
        whatsNewRef.current &&
        !whatsNewRef.current.contains(target)
      ) {
        closeWhatsNew();
      }
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        closeUserMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    isProjectMenuOpen,
    isHelpOpen,
    isWhatsNewOpen,
    isUserMenuOpen,
    closeProjectMenu,
    closeHelp,
    closeWhatsNew,
    closeUserMenu,
  ]);

  // -------------------------------------------------------------
  // GSAP Entrance: Help Dropdown
  // -------------------------------------------------------------
  useEffect(() => {
    if (isHelpOpen && helpMenuRef.current) {
      gsap.killTweensOf(helpMenuRef.current);
      gsap.fromTo(
        helpMenuRef.current,
        {
          opacity: 0,
          scale: 0.94,
          y: -8,
          transformOrigin: "top right",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.22,
          ease: "power2.out",
        }
      );
    }
  }, [isHelpOpen]);

  // -------------------------------------------------------------
  // GSAP Entrance: What's New Popover
  // -------------------------------------------------------------
  useEffect(() => {
    if (isWhatsNewOpen && whatsNewMenuRef.current) {
      gsap.killTweensOf(whatsNewMenuRef.current);
      gsap.fromTo(
        whatsNewMenuRef.current,
        {
          opacity: 0,
          scale: 0.94,
          y: -8,
          transformOrigin: "top right",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.22,
          ease: "power2.out",
        }
      );
    }
  }, [isWhatsNewOpen]);

  // -------------------------------------------------------------
  // GSAP Entrance: User Menu Dropdown
  // -------------------------------------------------------------
  useEffect(() => {
    if (isUserMenuOpen && userMenuDropdownRef.current) {
      gsap.killTweensOf(userMenuDropdownRef.current);
      gsap.fromTo(
        userMenuDropdownRef.current,
        {
          opacity: 0,
          scale: 0.94,
          y: -8,
          transformOrigin: "top right",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.22,
          ease: "power2.out",
        }
      );
    }
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    try {
      closeUserMenu();
      await auth.logout();
      router.push("/auth/login");
    } catch {
      router.push("/auth/login");
    }
  };

  // User monogram or fallback
  const userInitial = (
    user?.first_name?.[0] ||
    user?.username?.[0] ||
    user?.email?.[0] ||
    "A"
  ).toUpperCase();

  const userDisplayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || user?.email?.split("@")[0] || "Developer";

  return (
    <>
      <header
        className={cn(
          "border-border sticky top-0 z-40 flex h-12 w-full items-center justify-between border-b bg-white px-4 text-sm transition-colors select-none",
          className
        )}
      >
        {/* Left Side: DevNest Logo + Separator + Breadcrumbs */}
        <div className="flex items-center">
          <Link
            href="/workspace"
            className="flex items-center transition-opacity hover:opacity-85 focus:outline-none"
            aria-label="DevNest Home"
          >
            <Image
              src="/assets/images/dev-nest-logo.png"
              alt="DevNest Logo"
              width={22}
              height={22}
              priority
              className="h-5.5 w-5.5 shrink-0 object-contain"
            />
          </Link>

          {/* Slash Separator */}
          <span className="text-border-hover mx-2.5 text-sm font-light select-none">
            /
          </span>

          {/* Project Switcher (When on Project Detail) OR Breadcrumb / Title */}
          {isProjectDetailPage ? (
            <div className="relative" ref={projectMenuRef}>
              <button
                type="button"
                onClick={() =>
                  isProjectMenuOpen ? closeProjectMenu() : openProjectMenu()
                }
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium transition-colors hover:bg-zinc-100 focus:outline-none"
              >
                <Boxes className="text-description h-4 w-4 shrink-0" />
                <span className="text-sm font-normal tracking-tight text-zinc-900">
                  {currentProject?.name}
                </span>
                <span className="text-description inline-flex items-center justify-center rounded-full border border-zinc-200 px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wider uppercase">
                  {currentProject?.tier || "FREE"}
                </span>
                <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100/80 text-zinc-500">
                  <ChevronsUpDown className="h-3 w-3" />
                </div>
              </button>

              {/* Project Switcher Dropdown */}
              {isProjectMenuOpen && (
                <div
                  ref={projectMenuDropdownRef}
                  className="absolute top-full left-0 z-50 mt-1.5 w-64 rounded-xl border border-zinc-200 bg-white shadow-xl select-none sm:w-72"
                >
                  {/* Search Input */}
                  <div className="flex items-center border-b border-zinc-200 px-3 py-2.5">
                    <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <input
                      ref={projectSearchInputRef}
                      type="text"
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      placeholder="Find project..."
                      className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                    />
                  </div>

                  {/* Projects List */}
                  <div className="max-h-56 overflow-y-auto border-b border-zinc-200 p-1">
                    {filteredProjects.map((proj) => {
                      const isSelected = Boolean(
                        (currentProject?.id && proj.id === currentProject.id) ||
                        (currentProject?.project_code &&
                          proj.project_code &&
                          proj.project_code === currentProject.project_code) ||
                        (currentProject?.ref &&
                          proj.ref &&
                          proj.ref === currentProject.ref) ||
                        (rawProjectCode &&
                          (proj.id === rawProjectCode ||
                            (proj.project_code &&
                              proj.project_code === rawProjectCode) ||
                            (proj.ref && proj.ref === rawProjectCode)))
                      );
                      return (
                        <button
                          key={proj.id}
                          type="button"
                          onClick={() => handleSwitchProject(proj)}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-zinc-100",
                            isSelected
                              ? "font-semibold text-zinc-900"
                              : "text-description"
                          )}
                        >
                          <span className="truncate">{proj.name}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 shrink-0 text-zinc-900" />
                          )}
                        </button>
                      );
                    })}
                    {filteredProjects.length === 0 && (
                      <div className="px-3 py-3 text-center text-xs text-zinc-400">
                        No projects found
                      </div>
                    )}
                  </div>

                  {/* All Projects */}
                  <div className="border-b border-zinc-200 p-1">
                    <Link
                      href="/workspace/projects"
                      onClick={closeProjectMenu}
                      className="flex w-full items-center rounded-md px-3 py-2 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      All Projects
                    </Link>
                  </div>

                  {/* + New project */}
                  <div className="p-1">
                    <Link
                      href="/workspace/projects/new"
                      onClick={closeProjectMenu}
                      className="flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      <Plus className="h-3.5 w-3.5 text-zinc-400" />
                      <span>New project</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : breadcrumbs && breadcrumbs.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && (
                    <span className="text-border-hover text-sm font-light select-none">
                      /
                    </span>
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-body hover:text-heading text-xs font-normal transition-colors sm:text-sm"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-heading text-xs font-normal sm:text-sm">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <Link
              href="/workspace"
              className="text-heading text-xs font-normal transition-colors hover:opacity-85 focus:outline-none sm:text-sm"
            >
              {title}
            </Link>
          )}
        </div>

        {/* Right Side: Feedback, Search pill, Help, Lightbulb, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Feedback Button */}
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="text-body hover:text-heading cursor-pointer rounded px-2 py-1 text-xs font-normal transition-colors hover:bg-zinc-100 focus:outline-none"
          >
            Feedback
          </button>

          {/* Search Trigger (Pill Shape) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="group border-border text-muted hover:border-border-hover flex h-7 cursor-pointer items-center gap-2 rounded-full border bg-white px-2 text-xs transition-all hover:bg-zinc-50 focus:outline-none sm:px-3"
            title="Search (Ctrl + K)"
          >
            <Search className="text-muted group-hover:text-body h-3.5 w-3.5 shrink-0 transition-colors" />
            <span className="text-muted group-hover:text-description hidden text-xs font-normal sm:inline">
              Search...
            </span>
            <kbd className="py-0.2 border-border text-muted pointer-events-none hidden items-center rounded border bg-zinc-50 px-1.5 font-mono text-[10px] sm:inline-flex">
              Ctrl K
            </kbd>
          </button>

          {/* Help Button (Circle) */}
          <div className="relative" ref={helpRef}>
            <button
              type="button"
              onClick={() => {
                if (isHelpOpen) {
                  closeHelp();
                } else {
                  if (isWhatsNewOpen) closeWhatsNew();
                  if (isUserMenuOpen) closeUserMenu();
                  openHelp();
                }
              }}
              aria-label="Help and support"
              className={cn(
                "border-border text-body hover:border-border-hover hover:text-heading flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition-all hover:bg-zinc-50 focus:outline-none",
                isHelpOpen && "border-border-hover text-heading bg-zinc-100"
              )}
            >
              <CircleHelp className="h-3.5 w-3.5 stroke-[1.75]" />
            </button>

            {/* Help Dropdown Menu (GSAP Animated) */}
            {isHelpOpen && (
              <div
                ref={helpMenuRef}
                className="border-border absolute right-0 z-50 mt-1.5 w-60 rounded-xl border bg-white p-1.5 shadow-lg"
              >
                <div className="text-muted px-2.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
                  Help & Documentation
                </div>
                <Link
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeHelp}
                  className="text-body hover:text-heading flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-zinc-100"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="text-muted h-3.5 w-3.5" />
                    Documentation
                  </span>
                  <ExternalLink className="text-muted h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeHelp();
                    setIsSearchOpen(true);
                  }}
                  className="text-body hover:text-heading flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-zinc-100"
                >
                  <span className="flex items-center gap-2">
                    <Search className="text-muted h-3.5 w-3.5" />
                    Command Menu
                  </span>
                  <kbd className="border-border text-muted rounded border px-1 font-mono text-[10px]">
                    Ctrl K
                  </kbd>
                </button>
                <div className="border-border-subtle my-1 border-t" />
                <div className="text-description flex items-center justify-between px-2.5 py-1 text-[11px]">
                  <span>System Status</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Operational
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Lightbulb (What's New) Button (Circle) */}
          <div className="relative" ref={whatsNewRef}>
            <button
              type="button"
              onClick={() => {
                if (isWhatsNewOpen) {
                  closeWhatsNew();
                } else {
                  if (isHelpOpen) closeHelp();
                  if (isUserMenuOpen) closeUserMenu();
                  openWhatsNew();
                }
              }}
              aria-label="What's new and changelog"
              className={cn(
                "border-border text-body hover:border-border-hover hover:text-heading flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition-all hover:bg-zinc-50 focus:outline-none",
                isWhatsNewOpen && "border-border-hover text-heading bg-zinc-100"
              )}
            >
              <Lightbulb className="h-3.5 w-3.5 stroke-[1.75]" />
            </button>

            {/* What's New Popover (GSAP Animated) */}
            {isWhatsNewOpen && (
              <div
                ref={whatsNewMenuRef}
                className="border-border absolute right-0 z-50 mt-1.5 w-72 rounded-xl border bg-white p-3 shadow-lg"
              >
                <div className="border-border-subtle flex items-center justify-between border-b pb-2">
                  <div className="text-heading flex items-center gap-1.5 text-xs font-semibold">
                    What&apos;s New in DevNest
                  </div>
                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                    v0.1.0
                  </span>
                </div>
                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="border-border-subtle rounded-lg border bg-zinc-50 p-2">
                    <p className="text-heading font-medium">
                      Supabase-Style Workspace Header
                    </p>
                    <p className="text-description mt-0.5 text-[11px]">
                      Brand-new navigation bar with quick command search,
                      feedback modal, and account controls.
                    </p>
                  </div>
                  <div className="border-border-subtle rounded-lg border bg-zinc-50 p-2">
                    <p className="text-heading font-medium">
                      Honeypot Security Defense
                    </p>
                    <p className="text-description mt-0.5 text-[11px]">
                      Silent bot traps added across authentication and
                      registration endpoints.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                if (isUserMenuOpen) {
                  closeUserMenu();
                } else {
                  if (isHelpOpen) closeHelp();
                  if (isWhatsNewOpen) closeWhatsNew();
                  openUserMenu();
                }
              }}
              aria-label="User profile menu"
              className={cn(
                "relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-zinc-950 text-xs font-medium text-white shadow-2xs transition-all hover:ring-2 hover:ring-zinc-300 focus:outline-none",
                isUserMenuOpen && "ring-2 ring-zinc-400"
              )}
            >
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={userDisplayName}
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[11px] font-semibold tracking-tight text-zinc-100">
                  {userInitial}
                </span>
              )}
            </button>

            {/* User Dropdown Menu (GSAP Animated) */}
            {isUserMenuOpen && (
              <div
                ref={userMenuDropdownRef}
                className="border-border absolute right-0 z-50 mt-1.5 w-64 rounded-xl border bg-white p-1.5 shadow-xl"
              >
                <div className="border-border-subtle border-b px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-heading truncate text-xs font-semibold">
                      {userDisplayName}
                    </p>
                    <span className="text-body rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase">
                      {user?.role || "Member"}
                    </span>
                  </div>
                  <p className="text-muted mt-0.5 truncate text-[11px]">
                    {user?.email || "developer@devnest.local"}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/workspace"
                    onClick={closeUserMenu}
                    className="text-body hover:text-heading flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-zinc-100"
                  >
                    <Layers className="text-muted h-3.5 w-3.5" />
                    <span>Workspace Overview</span>
                  </Link>

                  <Link
                    href="/workspace/projects"
                    onClick={closeUserMenu}
                    className="text-body hover:text-heading flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-zinc-100"
                  >
                    <FolderGit2 className="text-muted h-3.5 w-3.5" />
                    <span>Project Management</span>
                  </Link>
                </div>

                <div className="border-border-subtle border-t pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-3.5 w-3.5 text-red-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Extracted Command Palette Component */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Extracted Feedback Modal Component */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
};

export default Header;
