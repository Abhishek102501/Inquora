"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageBubble } from "@/components/chat/message-bubble";
import { RetrievalIndicator } from "@/components/visual/retrieval-indicator";
import { Composer } from "@/components/chat/composer";
import { EmptyChat } from "@/components/chat/empty-chat";
import { SourcesPanel } from "@/components/chat/sources-panel";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useChat } from "@/hooks/use-chat";
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
  const router = useRouter();
  const { conversationId: activeConversationId, messages, isThinking, send } = useChat(
    conversationId,
    initialMessages,
  );
  const [input, setInput] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(initialDocumentIds);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  // Starting a brand-new chat creates a conversation on the first message —
  // move the URL to /chat/{id} so refresh/back/bookmark all keep working.
  useEffect(() => {
    if (activeConversationId && !conversationId) {
      router.replace(`/chat/${activeConversationId}`);
    }
  }, [activeConversationId, conversationId, router]);

  async function handleSend(text?: string) {
    const content = text ?? input;
    setInput("");
    await send(content, selectedDocumentIds);
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
        <ChatHeader
          title={title}
          documents={headerDocuments}
          sourceCount={latestSources.length}
          onOpenSources={() => setSourcesOpen(true)}
        />

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyChat onSuggestion={(text) => handleSend(text)} />
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.32 }}
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
        </div>
      </div>

      {latestSources.length > 0 && (
        <div className="hidden w-72 shrink-0 border-l border-border lg:block">
          <SourcesPanel sources={latestSources} activeSourceId={activeSourceId} onSelect={setActiveSourceId} />
        </div>
      )}

      <Sheet open={sourcesOpen} onOpenChange={setSourcesOpen}>
        <SheetContent side="bottom" className="max-h-[75vh] p-0 lg:hidden">
          <SheetTitle className="sr-only">Sources</SheetTitle>
          <SourcesPanel sources={latestSources} activeSourceId={activeSourceId} onSelect={setActiveSourceId} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
