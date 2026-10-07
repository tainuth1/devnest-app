"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Cpu,
  KeyRound,
  Plus,
  Terminal,
  Copy,
  Check,
  Shield,
  Layers,
} from "lucide-react";
import { Button, toast } from "@/shared/components/ui";

const MCPPage = () => {
  const params = useParams();
  const projectCode = (params?.project_code as string) || "proj_1";
  const [copied, setCopied] = useState(false);

  const mcpConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        devnest: {
          command: "npx",
          args: ["-y", "@devnest/mcp-server", "--project", projectCode],
          env: {
            DEVNEST_PAT: "dn_live_xxxxxxxxxxxxxxxxxxxx",
          },
        },
      },
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(mcpConfigSnippet);
    setCopied(true);
    toast.success("Copied MCP config to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-1 flex-col bg-zinc-50/50">
      {/* Top Action Bar */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Cpu className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-zinc-900">
                Model Context Protocol (MCP) & Developer Tools
              </h1>
              <span className="py-0.2 rounded-full border border-sky-200 bg-sky-50 px-2 text-[10px] font-semibold text-sky-700">
                Protocol v1
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Connect Cursor, VS Code, and Antigravity directly to your project
              diagrams, schemas & specs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Generate Personal Access Token (PAT)
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
        {/* IDE Config Card */}
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-5 w-5 text-zinc-600" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  IDE MCP Server Configuration
                </h3>
                <p className="text-xs text-zinc-500">
                  Add this block to your{" "}
                  <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700">
                    mcp_config.json
                  </code>{" "}
                  in Cursor or Antigravity
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={
                copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
              onClick={handleCopy}
            >
              {copied ? "Copied" : "Copy Configuration"}
            </Button>
          </div>

          <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-200">
            <code>{mcpConfigSnippet}</code>
          </pre>
        </div>

        {/* MCP Tools Summary */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">
            Available Project Tools Exposed via MCP
          </h3>
          <div className="divide-y divide-zinc-100 text-xs">
            <div className="flex items-center justify-between py-2.5">
              <span className="font-mono text-zinc-800">
                devnest_get_project_context
              </span>
              <span className="text-zinc-500">
                Fetches PRD documents, active flows & schema models
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-mono text-zinc-800">
                devnest_get_db_schema
              </span>
              <span className="text-zinc-500">
                Returns normalized tables, relationships & PostgreSQL DDL
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-mono text-zinc-800">
                devnest_get_flow_diagram
              </span>
              <span className="text-zinc-500">
                Returns architecture graph nodes & sequence flow steps
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPPage;
