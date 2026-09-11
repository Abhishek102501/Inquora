"use client";

import { Loader2 } from "lucide-react";
import { useConversations } from "@/hooks/use-conversations";
import { useDocuments } from "@/hooks/use-documents";
import { PageHeader } from "@/components/shared/page-header";
import { ConversationList } from "@/components/conversations/conversation-list";

export default function ConversationsPage() {
  const { conversations, state, error, removeConversation } = useConversations();
  const { documents } = useDocuments();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title="Conversations"
        description={
          state === "loading"
            ? "Loading…"
            : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`
        }
      />
      {state === "loading" ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : state === "error" ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : (
        <ConversationList
          initialConversations={conversations}
          documents={documents}
          onDeleteConversation={removeConversation}
        />
      )}
    </div>
  );
}
