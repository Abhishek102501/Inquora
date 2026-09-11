"use client";

import { useCallback, useEffect, useState } from "react";
import * as chatApi from "@/lib/api/chat";
import { ApiError } from "@/lib/api/client";
import type { ChatMessage } from "@/types";

/**
 * Drives one conversation's message list and question/answer flow against
 * the real backend. UI-only concerns (which source is highlighted, whether
 * a mobile sources sheet is open, etc.) stay local to ChatView — this hook
 * only owns data: messages, retrieval/generation state, and errors.
 */
export function useChat(initialConversationId?: string, initialMessages: ChatMessage[] = []) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialConversationId) return;
    chatApi.listMessages(initialConversationId).then(setMessages).catch(() => {
      // Keep whatever we had rather than blanking the conversation on a
      // transient fetch failure.
    });
  }, [initialConversationId]);

  const send = useCallback(
    async (question: string, documentIds: string[] = []) => {
      const trimmed = question.trim();
      if (!trimmed) return;

      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
        status: "complete",
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);
      setError(null);

      try {
        const result = await chatApi.askQuestion(trimmed, { conversationId, documentIds });
        setConversationId(result.conversationId);
        setMessages((prev) => [...prev, result.message]);
        return result;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Something went wrong.";
        setError(message);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now() + 1}`,
            role: "assistant",
            content: message,
            createdAt: new Date().toISOString(),
            status: "error",
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [conversationId],
  );

  return { conversationId, messages, isThinking, error, send };
}
