"use client";

import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";
import { ChatView } from "@/components/chat/chat-view";

export default function NewChatPage() {
  const searchParams = useSearchParams();
  const document = searchParams.get("document");
  const { documents, state } = useDocuments();

  if (state === "loading") {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <ChatView
      title="New chat"
      documents={documents}
      initialMessages={[]}
      initialDocumentIds={document ? [document] : []}
    />
  );
}
