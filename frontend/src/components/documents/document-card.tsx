"use client";

import Link from "next/link";
import { FileText, MoreVertical, MessageSquarePlus, Trash2, Download, Star, StarOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/documents/status-badge";
import { formatBytes, formatDate } from "@/lib/format";
import type { AppDocument } from "@/types";
import { cn } from "cn";

export function DocumentCard({
  document,
  view,
  onDelete,
  deleteLabel = "Delete",
  onToggleFavorite,
}: {
  document: AppDocument;
  view: "grid" | "list";
  onDelete?: (doc: AppDocument) => void;
  deleteLabel?: string;
  onToggleFavorite?: (doc: AppDocument) => void;
}) {
  const isReady = document.status === "ready";
  const isRemoveFromFavorites = deleteLabel === "Remove from favorites";

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
          aria-label={`Actions for ${document.name}`}
          onClick={(e) => e.preventDefault()}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/chat?document=${document.id}`}>
            <MessageSquarePlus className="mr-2 size-4" /> Ask about this document
          </Link>
        </DropdownMenuItem>
        {onToggleFavorite && (
          <DropdownMenuItem onClick={() => onToggleFavorite(document)}>
            {document.favorite ? (
              <>
                <StarOff className="mr-2 size-4" /> Remove from favorites
              </>
            ) : (
              <>
                <Star className="mr-2 size-4" /> Add to favorites
              </>
            )}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem disabled>
          <Download className="mr-2 size-4" /> Download
        </DropdownMenuItem>
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant={isRemoveFromFavorites ? "default" : "destructive"}
              onClick={() => onDelete(document)}
            >
              {isRemoveFromFavorites ? (
                <StarOff className="mr-2 size-4" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              {deleteLabel}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (view === "list") {
    return (
      <Card
        className={cn(
          "group flex-row items-center gap-3 px-4 py-3 transition-all duration-300",
          isReady && "hover:-translate-y-0.5 hover:border-signal/30 hover:shadow-md",
        )}
      >
        <Link
          href={`/documents/${document.id}`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-md bg-signal/10 text-signal transition-transform duration-300",
              isReady && "group-hover:scale-110 group-hover:-rotate-3",
            )}
          >
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium transition-colors duration-200 group-hover:text-signal">
              {document.favorite && <Star className="size-3 shrink-0 fill-highlight-foreground text-highlight-foreground" />}
              {document.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {document.pages} pages &middot; {formatBytes(document.sizeBytes)} &middot;{" "}
              {formatDate(document.uploadedAt)}
            </p>
          </div>
        </Link>
        <StatusBadge status={document.status} />
        {menu}
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group gap-3 p-4 transition-all duration-300",
        isReady && "hover:-translate-y-1 hover:border-signal/30 hover:shadow-lg",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-md bg-signal/10 text-signal transition-transform duration-300",
            isReady && "group-hover:scale-110 group-hover:-rotate-3",
          )}
        >
          <FileText className="size-5" />
        </div>
        {menu}
      </div>
      <Link href={`/documents/${document.id}`} className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium transition-colors duration-200 group-hover:text-signal">
          {document.favorite && <Star className="size-3 shrink-0 fill-highlight-foreground text-highlight-foreground" />}
          {document.name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {document.pages} pages &middot; {formatBytes(document.sizeBytes)}
        </p>
      </Link>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formatDate(document.uploadedAt)}</span>
        <StatusBadge status={document.status} />
      </div>
    </Card>
  );
}
