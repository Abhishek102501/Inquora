import { mockMessagesByConversation } from "@/data/mock-conversations";
import type { ChatMessage, SourceCitation } from "@/types";

// NOTE: Mock-backed for now. Replace `sendMessage` with a call to the RAG
// backend (e.g. POST /api/conversations/:id/messages), most likely streamed
// via server-sent events — the ChatMessage["status"] field already models
// the "streaming" state so the UI does not need to change shape later.

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  return delay([...(mockMessagesByConversation[conversationId] ?? [])]);
}

const canned: { answer: string; sources: SourceCitation[] }[] = [
  {
    answer:
      "Based on the document, the key finding is stated directly in the summary section, with supporting detail in the later analysis pages.",
    sources: [
      {
        id: `src_${Date.now()}_1`,
        documentId: "doc_1",
        documentName: "Attention Is All You Need.pdf",
        page: 3,
        snippet: "The mechanism allows the model to jointly attend to information from different representation subspaces.",
      },
      {
        id: `src_${Date.now()}_2`,
        documentId: "doc_1",
        documentName: "Attention Is All You Need.pdf",
        page: 12,
        snippet: "Table 3 shows the effect of varying the number of attention heads on validation perplexity.",
      },
    ],
  },
];

export async function sendMessage(
  _conversationId: string,
  _content: string,
): Promise<ChatMessage> {
  const pick = canned[0];
  return delay(
    {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: pick.answer,
      createdAt: new Date().toISOString(),
      status: "complete",
      sources: pick.sources,
    },
    2100,
  );
}
