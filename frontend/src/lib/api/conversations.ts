import { request } from "@/lib/api/client";
import type { Conversation } from "@/types";

interface BackendConversation {
  id: string;
  title: string;
  document_ids: string[];
  created_at: string;
  updated_at: string;
}

// The backend's conversation list does not include a last-message preview
// or message count today — those fields are populated as empty/zero here
// rather than fabricated. See README/final report for this known gap.
function toConversation(c: BackendConversation): Conversation {
  return {
    id: c.id,
    title: c.title,
    documentIds: c.document_ids,
    lastMessage: "",
    updatedAt: c.updated_at,
    createdAt: c.created_at,
    messageCount: 0,
  };
}

export async function listConversations(): Promise<Conversation[]> {
  const data = await request<{ items: BackendConversation[] }>("/conversations");
  return data.items.map(toConversation);
}

export async function getConversation(id: string): Promise<Conversation> {
  const data = await request<BackendConversation>(`/conversations/${id}`);
  return toConversation(data);
}

export async function createConversation(documentIds: string[] = []): Promise<Conversation> {
  const data = await request<BackendConversation>("/conversations", {
    method: "POST",
    body: { document_ids: documentIds },
  });
  return toConversation(data);
}

export async function deleteConversation(id: string): Promise<void> {
  await request<void>(`/conversations/${id}`, { method: "DELETE" });
}
