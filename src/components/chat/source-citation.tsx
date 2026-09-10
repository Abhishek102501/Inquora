"use client";

import { FileText, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SourceCitation } from "@/types";
import { cn } from "cn";

export function SourceCitationChip({
  source,
  index,
  isActive,
  onHoverChange,
}: {
  source: SourceCitation;
  index: number;
  isActive?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.18 }}
          onMouseEnter={() => onHoverChange?.(true)}
          onMouseLeave={() => onHoverChange?.(false)}
          className={cn(
            "group flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left shadow-sm transition-colors duration-200",
            isActive
              ? "border-signal/50 bg-signal/8 shadow-md"
              : "border-border bg-card hover:border-signal/40 hover:bg-signal/5 hover:shadow-md",
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-highlight font-mono text-[10px] font-semibold text-highlight-foreground transition-transform duration-200 group-hover:scale-110">
            {index}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium text-foreground group-hover:text-signal">
              {source.documentName}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              Page {source.page}
              <ArrowUpRight className="size-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </span>
          </span>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="flex items-start gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-signal/10 text-signal">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{source.documentName}</p>
            <p className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span className="font-medium text-signal">SOURCE {index}</span> &middot; Page{" "}
              {source.page}
            </p>
          </div>
        </div>
        <blockquote className="mt-3 border-l-2 border-highlight pl-3 font-serif text-sm italic leading-relaxed text-foreground/85">
          &ldquo;{source.snippet}&rdquo;
        </blockquote>
      </PopoverContent>
    </Popover>
  );
}
