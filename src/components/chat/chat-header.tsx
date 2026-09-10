"use client";

import { FileText, MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AIStatusIndicator } from "@/components/visual/ai-status-indicator";
import type { AppDocument } from "@/types";

export function ChatHeader({
  title,
  documents,
}: {
  title: string;
  documents: AppDocument[];
}) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {documents.length > 0 && (
          <div className="mt-0.5 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
            <FileText className="size-3 shrink-0" />
            <span className="truncate">{documents.map((d) => d.name).join(", ")}</span>
          </div>
        )}
      </div>

      <AIStatusIndicator className="hidden sm:inline-flex" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Conversation actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => toast.info("Renaming isn't wired up in this preview.")}>
            <Pencil className="mr-2 size-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Export isn't wired up in this preview.")}>
            <Download className="mr-2 size-4" /> Export transcript
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => toast.success("Conversation deleted.")}
          >
            <Trash2 className="mr-2 size-4" /> Delete conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
