"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Plus,
  FolderPlus,
  Search,
  BookOpen,
  FileCode,
  Lock,
} from "lucide-react";
import { Button } from "@/shared/components/ui";

const DocumentsPage = () => {
  const params = useParams();
  const projectCode = (params?.project_code as string) || "proj_1";

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-3rem)] bg-zinc-50/50">
      {/* Top Action Bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">
                Documents & Specifications
              </h1>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.2 text-[10px] font-semibold text-sky-700">
                Markdown Engine
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Technical PRDs, architectural decision records, and API contracts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<FolderPlus className="h-3.5 w-3.5 text-zinc-500" />}>
            New Folder
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            New Document
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl rounded-2xl border-2 border-dashed border-zinc-200 bg-white/70 p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <BookOpen className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-900">
            Hierarchical Markdown Documentation
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
            Author and preview GitHub Flavored Markdown (GFM) documents with live syntax highlighting, embedded Mermaid diagrams, and client-side encryption.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Create System Architecture Spec
            </Button>
            <Button variant="outline" size="sm" leftIcon={<FileCode className="h-3.5 w-3.5 text-zinc-500" />}>
              Import Markdown (.md)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
