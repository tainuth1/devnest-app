"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  Database,
  Plus,
  Code2,
  TableProperties,
  ArrowRightLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui";

const DatabaseSchemaPage = () => {
  const params = useParams();
  const projectCode = (params?.project_code as string) || "proj_1";

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-1 flex-col bg-zinc-50/50">
      {/* Top Action Bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Database className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">
                Database Schema Planner
              </h1>
              <span className="py-0.2 rounded-full border border-emerald-200 bg-emerald-50 px-2 text-[10px] font-semibold text-emerald-700">
                DrawDB Engine
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Relational ERD modeling, visual foreign keys & real-time SQL DDL
              export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Code2 className="h-3.5 w-3.5 text-zinc-500" />}
          >
            Export SQL DDL
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            New Table
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl rounded-2xl border-2 border-dashed border-zinc-200 bg-white/70 p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <TableProperties className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-900">
            Visual Relational Schema Canvas
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
            Design PostgreSQL, MySQL, SQLite and MariaDB relational models with
            visual foreign-key connectors, custom enum types, and subject areas.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Create Primary Schema
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={
                <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-500" />
              }
            >
              Import Existing DDL
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchemaPage;
