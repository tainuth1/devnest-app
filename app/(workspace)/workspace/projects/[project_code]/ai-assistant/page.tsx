"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Send,
  Bot,
  Layers,
  Database,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/components/ui";

const AIAssistantPage = () => {
  const params = useParams();
  const projectCode = (params?.project_code as string) || "proj_1";
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-1 flex-col bg-zinc-50/50">
      {/* Top Action Bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">
                AI Planning Assistant
              </h1>
              <span className="py-0.2 rounded-full border border-purple-200 bg-purple-50 px-2 text-[10px] font-semibold text-purple-700">
                Context Engine
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Prompt-driven architecture flows, database schema proposals, and
              PRD specifications
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-between p-6">
        <div className="space-y-6 pt-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Bot className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Dev Nest AI Agent Ready
                </h3>
                <p className="text-xs leading-relaxed text-zinc-600">
                  I can automatically build context from your active project
                  documents, existing DrawDB schemas, and Draw.io sequence
                  diagrams to propose new architecture blocks or generate SQL
                  migrations with staged human-in-the-loop approvals.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 transition-all hover:border-purple-300 hover:bg-purple-50/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                  <Database className="h-4 w-4 text-emerald-600" />
                  <span>Generate Auth Schema</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Tables for OAuth, session tokens, and RBAC roles
                </p>
              </div>

              <div className="cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 transition-all hover:border-purple-300 hover:bg-purple-50/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span>Design Sequence Flow</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Draw.io sequence diagram for API token refresh
                </p>
              </div>

              <div className="cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 transition-all hover:border-purple-300 hover:bg-purple-50/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                  <FileText className="h-4 w-4 text-sky-600" />
                  <span>Draft API Contract PRD</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Markdown spec with error matrix & rate limits
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="pt-4">
          <div className="relative flex items-center rounded-2xl border border-zinc-300 bg-white p-2 shadow-xs focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Dev Nest AI to propose a schema, flow, or document..."
              className="flex-1 bg-transparent px-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
            <Button size="sm" leftIcon={<Send className="h-3.5 w-3.5" />}>
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
