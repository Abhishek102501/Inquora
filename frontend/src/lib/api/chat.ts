import { request } from "@/lib/api/client";
import type { ChatMessage, SourceCitation } from "@/types";

interface BackendSource {
  document_id: string;
  filename: string;
  page_number: number;
  chunk_id: string;
  excerpt: string;
  score: number;
}

interface ChatResponse {
  conversation_id: string;
  answer: string;
  sources: BackendSource[];
  grounded: boolean;
}

interface BackendMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: BackendSource[];
  created_at: string;
}

function toSourceCitation(source: BackendSource): SourceCitation {
  return {
    id: source.chunk_id,
    documentId: source.document_id,
    documentName: source.filename,
    page: source.page_number,
    snippet: source.excerpt,
  };
}

export interface AskResult {
  conversationId: string;
  message: ChatMessage;
  grounded: boolean;
}

function toChatMessage(
  id: string,
  content: string,
  sources: BackendSource[],
  createdAt: string,
  grounded: boolean,
): ChatMessage {
  return {
    id,
    role: "assistant",
    content,
    createdAt,
    sources: sources.map(toSourceCitation),
    status: grounded ? "complete" : "no-answer",
  };
}

export async function askQuestion(
  question: string,
  options: { conversationId?: string; documentIds?: string[] } = {},
): Promise<AskResult> {
  const path = options.conversationId ? `/chat/${options.conversationId}/messages` : "/chat";
  const data = await request<ChatResponse>(path, {
    method: "POST",
    body: { question, document_ids: options.documentIds ?? [] },
    timeoutMs: 60_000, // RAG generation can legitimately take longer than a normal request
  });
  return {
    conversationId: data.conversation_id,
    message: toChatMessage(
      `msg_${Date.now()}`,
      data.answer,
      data.sources,
      new Date().toISOString(),
      data.grounded,
    ),
    grounded: data.grounded,
  };
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const data = await request<{ items: BackendMessage[] }>(
    `/conversations/${conversationId}/messages`,
  );
  return data.items.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.created_at,
    sources: m.sources.map(toSourceCitation),
    status: "complete",
  }));
}
