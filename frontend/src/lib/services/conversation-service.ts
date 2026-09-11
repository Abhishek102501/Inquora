import { mockConversations } from "@/data/mock-conversations";
import type { Conversation } from "@/types";

// NOTE: Mock-backed for now. Replace with FastAPI calls later, e.g.
// GET /api/conversations, DELETE /api/conversations/:id.

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function listConversations(): Promise<Conversation[]> {
  return delay([...mockConversations]);
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  return delay(mockConversations.find((c) => c.id === id));
}

export async function deleteConversation(_id: string): Promise<void> {
  return delay(undefined, 200);
}

export async function createConversation(documentIds: string[]): Promise<Conversation> {
  const conversation: Conversation = {
    id: `conv_${Date.now()}`,
    title: "New conversation",
    documentIds,
    lastMessage: "",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    messageCount: 0,
  };
  return delay(conversation, 200);
}
