"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MdxCodeTabsProps {
  npm: string;
  pnpm: string;
  bun: string;
  yarn: string;
}

const TABS = ["pnpm", "npm", "bun", "yarn"] as const;
type Tab = (typeof TABS)[number];

export function MdxCodeTabs({ npm, pnpm, bun, yarn }: MdxCodeTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("pnpm");
  const [copied, setCopied] = useState(false);

  const commands: Record<Tab, string> = { pnpm, npm, bun, yarn };
  const activeCode = commands[activeTab];

  const copy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="not-prose w-full rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-6">
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        {/* Terminal icon */}
        <div className="flex items-center justify-center h-6 w-6 rounded bg-zinc-600 dark:bg-zinc-700 text-white text-[10px] font-mono font-bold select-none">
          &gt;_
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-7 px-3 rounded-md text-sm font-mono transition-all border ${
                activeTab === tab
                  ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 shadow-sm"
                  : "bg-transparent text-zinc-500 dark:text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Code area */}
      <div className="relative group bg-white dark:bg-zinc-950 px-5 py-4">
        <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto">
          <code>{activeCode}</code>
        </pre>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={copy}
          className="absolute top-2.5 right-2.5 h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
