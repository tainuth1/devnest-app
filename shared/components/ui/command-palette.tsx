"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import {
  Search,
  X,
  ChevronRight,
  Layers,
  FolderGit2,
  User as UserIcon,
  Shield,
  BookOpen,
  Plus,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  category: string;
  href: string;
  icon: React.ReactNode;
}

const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Create New Project",
    category: "Actions",
    href: "/workspace/projects/new",
    icon: <Plus className="text-description h-4 w-4" />,
  },
  {
    title: "Organizations",
    category: "Workspace",
    href: "/workspace",
    icon: <Layers className="text-description h-4 w-4" />,
  },
  {
    title: "Projects",
    category: "Workspace",
    href: "/workspace/projects",
    icon: <FolderGit2 className="text-description h-4 w-4" />,
  },
  {
    title: "Profile & Account",
    category: "Settings",
    href: "/workspace",
    icon: <UserIcon className="text-description h-4 w-4" />,
  },
  {
    title: "Security & Authentication",
    category: "Settings",
    href: "/workspace",
    icon: <Shield className="text-description h-4 w-4" />,
  },
  {
    title: "DevNest Documentation",
    category: "Resources",
    href: "#docs",
    icon: <BookOpen className="text-description h-4 w-4" />,
  },
];

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items?: NavigationItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  items = DEFAULT_NAVIGATION_ITEMS,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          setSearchQuery("");
          onClose();
        },
      });
    } else {
      setSearchQuery("");
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

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC and Ctrl/Cmd + K when palette is open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const filteredNavigation = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 backdrop-blur-xs sm:pt-20"
    >
      <div
        ref={cardRef}
        className="border-border relative w-full max-w-xl overflow-hidden rounded-xl border bg-white shadow-2xl"
      >
        {/* Search Input Bar */}
        <div className="border-border flex items-center border-b px-4 py-3">
          <Search className="text-muted h-4 w-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, organizations, documentation..."
            className="text-heading placeholder:text-muted ml-3 flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-heading cursor-pointer rounded p-1 transition-colors hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results / Navigation List */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredNavigation.length === 0 ? (
            <div className="text-muted py-8 text-center text-xs">
              No matching results found for &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-muted px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
                Quick Navigation
              </div>
              {filteredNavigation.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (item.href.startsWith("/")) {
                      router.push(item.href);
                    }
                  }}
                  className="group text-body hover:text-heading flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-zinc-100"
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="text-heading font-medium">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted text-[11px]">
                      {item.category}
                    </span>
                    <ChevronRight className="text-muted group-hover:text-description h-3.5 w-3.5 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer with key hints */}
        <div className="border-border-subtle text-muted flex items-center justify-between border-t bg-zinc-50 px-3 py-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span>Navigation shortcut:</span>
            <kbd className="border-border text-description rounded border bg-white px-1.5 py-0.5 font-mono text-[10px]">
              Ctrl K
            </kbd>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Close:</span>
            <kbd className="border-border text-description rounded border bg-white px-1.5 py-0.5 font-mono text-[10px]">
              ESC
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
