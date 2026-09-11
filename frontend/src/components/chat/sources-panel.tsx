"use client";

import { FileText, Quote } from "lucide-react";
import { motion } from "motion/react";
import type { SourceCitation } from "@/types";
import { cn } from "cn";

function relevanceFor(index: number) {
  return Math.max(72, 96 - index * 7);
}

export function SourcesPanel({
  sources,
  activeSourceId,
  onSelect,
}: {
  sources: SourceCitation[];
  activeSourceId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (sources.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <FileText className="size-5 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">
          Sources for the latest answer will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3.5">
        <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Sources &middot; {sources.length}
        </p>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-3">
        {sources.map((source, i) => {
          const isActive = activeSourceId === source.id;
          const relevance = relevanceFor(i);
          return (
            <button
              key={source.id}
              onClick={() => onSelect(isActive ? null : source.id)}
              onMouseEnter={() => onSelect(source.id)}
              onMouseLeave={() => onSelect(null)}
              className={cn(
                "flex flex-col gap-2 rounded-lg border p-3 text-left transition-all duration-200",
                isActive
                  ? "-translate-y-0.5 border-signal/40 bg-signal/5 shadow-md"
                  : "border-border bg-card hover:border-signal/20",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-signal">
                  <span className="flex size-4 items-center justify-center rounded-sm bg-highlight text-[9px] font-semibold text-highlight-foreground">
                    {i + 1}
                  </span>
                  PAGE {source.page}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{relevance}%</span>
              </div>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {source.documentName}
              </p>
              <p className="flex items-start gap-1.5 text-xs leading-relaxed text-foreground/80">
                <Quote className="mt-0.5 size-3 shrink-0 text-highlight-foreground/70" />
                {source.snippet}
              </p>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${relevance}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                  className={cn("h-full rounded-full", isActive ? "bg-signal" : "bg-signal/50")}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
