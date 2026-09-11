"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Upload, LayoutGrid, List as ListIcon, FileStack, Star } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentCard } from "@/components/documents/document-card";
import { StaggerGroup, StaggerItem } from "@/components/visual/fade-in";
import type { AppDocument, DocumentStatus } from "@/types";
import { cn } from "cn";

type SortKey = "newest" | "oldest" | "name" | "pages";

export function DocumentLibrary({
  initialDocuments,
  initialQuery,
  mode = "library",
}: {
  initialDocuments: AppDocument[];
  initialQuery?: string;
  mode?: "library" | "favorites";
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [status, setStatus] = useState<DocumentStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [pendingDelete, setPendingDelete] = useState<AppDocument | null>(null);

  const filtered = useMemo(() => {
    let list = documents.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
    if (status !== "all") list = list.filter((d) => d.status === status);
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "pages":
          return b.pages - a.pages;
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });
    return list;
  }, [documents, query, status, sort]);

  function toggleFavorite(doc: AppDocument) {
    setDocuments((docs) =>
      docs.map((d) => (d.id === doc.id ? { ...d, favorite: !d.favorite } : d)),
    );
    toast.success(doc.favorite ? `Removed "${doc.name}" from favorites` : `Added "${doc.name}" to favorites`);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    setDocuments((docs) => docs.filter((d) => d.id !== pendingDelete.id));
    toast.success(
      mode === "favorites"
        ? `Removed "${pendingDelete.name}" from favorites`
        : `Deleted "${pendingDelete.name}"`,
    );
    setPendingDelete(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents by name…"
            className="pl-8"
            aria-label="Search documents"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="error">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
              <SelectItem value="pages">Most pages</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border border-border p-0.5">
            <button
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={cn(
                "flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors",
                view === "grid" && "bg-muted text-foreground",
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={cn(
                "flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors",
                view === "list" && "bg-muted text-foreground",
              )}
            >
              <ListIcon className="size-4" />
            </button>
          </div>
          <Button className="bg-signal text-signal-foreground hover:bg-signal/90" asChild>
            <Link href="/documents/upload">
              <Upload className="size-4" /> Upload
            </Link>
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={mode === "favorites" ? Star : FileStack}
          title={
            documents.length === 0
              ? mode === "favorites"
                ? "No favorites yet"
                : "No documents yet"
              : "No documents match your search"
          }
          description={
            documents.length === 0
              ? mode === "favorites"
                ? "Star a document from your library to pin it here."
                : "Upload your first PDF to start asking questions."
              : "Try a different search term or clear your filters."
          }
          action={
            documents.length === 0 && (
              <Button className="bg-signal text-signal-foreground hover:bg-signal/90" asChild>
                <Link href={mode === "favorites" ? "/documents" : "/documents/upload"}>
                  {mode === "favorites" ? (
                    "Browse documents"
                  ) : (
                    <>
                      <Upload className="size-4" /> Upload a PDF
                    </>
                  )}
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <StaggerGroup
          key={view}
          viewport={false}
          stagger={0.045}
          className={cn(
            view === "grid"
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-2",
          )}
        >
          {filtered.map((doc) => (
            <StaggerItem key={doc.id}>
              <DocumentCard
                document={doc}
                view={view}
                onDelete={setPendingDelete}
                deleteLabel={mode === "favorites" ? "Remove from favorites" : "Delete"}
                onToggleFavorite={mode === "library" ? toggleFavorite : undefined}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {mode === "favorites"
                ? `Remove "${pendingDelete?.name}" from favorites?`
                : `Delete "${pendingDelete?.name}"?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mode === "favorites"
                ? "The document stays in your library — this only unpins it from favorites."
                : "This will permanently remove the document and any conversations tied to it. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={mode === "favorites" ? "" : "bg-destructive text-white hover:bg-destructive/90"}
              onClick={confirmDelete}
            >
              {mode === "favorites" ? "Remove" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
