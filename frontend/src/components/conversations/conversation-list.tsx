"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessagesSquare, Search, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatRelativeTime } from "@/lib/format";
import type { AppDocument, Conversation } from "@/types";

export function ConversationList({
  initialConversations,
  documents,
  onDeleteConversation,
}: {
  initialConversations: Conversation[];
  documents: AppDocument[];
  onDeleteConversation: (id: string) => Promise<void>;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing an external prop that arrives after mount, not derivable during render
    setConversations(initialConversations);
  }, [initialConversations]);

  const docNameById = useMemo(
    () => new Map(documents.map((d) => [d.id, d.name])),
    [documents],
  );

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(query.toLowerCase()),
  );

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteConversation(pendingDelete.id);
      setConversations((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      toast.success(`Deleted "${pendingDelete.title}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete this conversation.");
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="pl-8"
            aria-label="Search conversations"
          />
        </div>
        <Button className="bg-signal text-signal-foreground hover:bg-signal/90" asChild>
          <Link href="/chat">
            <Plus className="size-4" /> New chat
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title={conversations.length === 0 ? "No conversations yet" : "No conversations match your search"}
          description={
            conversations.length === 0
              ? "Start a conversation to ask questions about your documents."
              : "Try a different search term."
          }
          action={
            conversations.length === 0 && (
              <Button className="bg-signal text-signal-foreground hover:bg-signal/90" asChild>
                <Link href="/chat">
                  <Plus className="size-4" /> New chat
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <Card className="divide-y divide-border py-0">
          {filtered.map((conv) => (
            <div key={conv.id} className="group flex items-center gap-3 px-4 py-3.5 transition-colors duration-200 hover:bg-muted/40">
              <Link href={`/chat/${conv.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-signal/10 text-signal transition-transform duration-300 group-hover:scale-110">
                  <MessagesSquare className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium transition-colors duration-200 group-hover:text-signal">{conv.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{conv.lastMessage}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {conv.documentIds.slice(0, 2).map((id) => (
                      <span key={id} className="flex items-center gap-1">
                        <FileText className="size-3" /> {docNameById.get(id) ?? "Unknown document"}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(conv.updatedAt)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${conv.title}`}
                onClick={() => setPendingDelete(conv)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </Card>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{pendingDelete?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and its messages. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
