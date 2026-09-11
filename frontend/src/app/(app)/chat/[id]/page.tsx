"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";
import { getConversation } from "@/lib/api/conversations";
import { listMessages } from "@/lib/api/chat";
import { ApiError } from "@/lib/api/client";
import { ChatView } from "@/components/chat/chat-view";
import type { ChatMessage, Conversation } from "@/types";

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const { documents, state: documentsState } = useDocuments();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notFoundError, setNotFoundError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getConversation(params.id), listMessages(params.id)])
      .then(([conv, msgs]) => {
        setConversation(conv);
        setMessages(msgs);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundError(true);
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (notFoundError) notFound();

  if (isLoading || documentsState === "loading" || !conversation) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <ChatView
      conversationId={conversation.id}
      title={conversation.title}
      documents={documents}
      initialMessages={messages}
      initialDocumentIds={conversation.documentIds}
    />
  );
}
