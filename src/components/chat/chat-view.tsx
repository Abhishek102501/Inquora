"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageBubble } from "@/components/chat/message-bubble";
import { RetrievalIndicator } from "@/components/visual/retrieval-indicator";
import { Composer } from "@/components/chat/composer";
import { EmptyChat } from "@/components/chat/empty-chat";
import { SourcesPanel } from "@/components/chat/sources-panel";
import { sendMessage } from "@/lib/services/chat-service";
import { messageIn } from "@/lib/motion";
import type { AppDocument, ChatMessage } from "@/types";

export function ChatView({
  conversationId,
  title,
  documents,
  initialMessages,
  initialDocumentIds,
}: {
  conversationId?: string;
  title: string;
  documents: AppDocument[];
  initialMessages: ChatMessage[];
  initialDocumentIds: string[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(initialDocumentIds);
  const [isThinking, setIsThinking] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
      status: "complete",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    const lower = content.toLowerCase();

    try {
      if (lower.includes("error")) {
        await new Promise((r) => setTimeout(r, 1700));
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now() + 1}`,
            role: "assistant",
            content:
              "Something went wrong generating a response. Check your connection and try asking again.",
            createdAt: new Date().toISOString(),
            status: "error",
          },
        ]);
        return;
      }

      if (lower.includes("no info") || lower.includes("not in the document")) {
        await new Promise((r) => setTimeout(r, 1700));
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now() + 1}`,
            role: "assistant",
            content:
              "I couldn't find anything in the selected documents that answers this. Try rephrasing, or select a different document to search.",
            createdAt: new Date().toISOString(),
            status: "no-answer",
          },
        ]);
        return;
      }

      const response = await sendMessage(conversationId ?? "new", content);
      setMessages((prev) => [...prev, response]);
    } finally {
      setIsThinking(false);
    }
  }

  function toggleDocument(id: string) {
    setSelectedDocumentIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }

  const headerDocuments =
    selectedDocumentIds.length > 0
      ? documents.filter((d) => selectedDocumentIds.includes(d.id))
      : [];

  const latestSources = [...messages].reverse().find((m) => m.sources && m.sources.length > 0)
    ?.sources ?? [];

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader title={title} documents={headerDocuments} />

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyChat onSuggestion={(text) => handleSend(text)} />
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial="hidden"
                    animate="show"
                    variants={messageIn}
                  >
                    <MessageBubble
                      message={message}
                      activeSourceId={activeSourceId}
                      onHoverSource={setActiveSourceId}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {isThinking && <RetrievalIndicator />}
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-4 md:px-6">
          <Composer
            value={input}
            onChange={setInput}
            onSend={() => handleSend()}
            documents={documents}
            selectedDocumentIds={selectedDocumentIds}
            onToggleDocument={toggleDocument}
            disabled={isThinking}
          />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Try asking something, or type a message containing &ldquo;error&rdquo; or &ldquo;no info&rdquo; to preview those states.
          </p>
        </div>
      </div>

      {latestSources.length > 0 && (
        <div className="hidden w-72 shrink-0 border-l border-border lg:block">
          <SourcesPanel sources={latestSources} activeSourceId={activeSourceId} onSelect={setActiveSourceId} />
        </div>
      )}
    </div>
  );
}
