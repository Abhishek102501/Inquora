import { mockDocuments } from "@/data/mock-documents";
import type { AppDocument } from "@/types";

// NOTE: This service returns mock data. Swap the function bodies for calls to
// the FastAPI backend (e.g. `fetch("/api/documents")`) without changing the
// call sites that consume this service.

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function listDocuments(): Promise<AppDocument[]> {
  return delay([...mockDocuments]);
}

export async function getDocument(id: string): Promise<AppDocument | undefined> {
  return delay(mockDocuments.find((doc) => doc.id === id));
}

export async function deleteDocument(_id: string): Promise<void> {
  return delay(undefined, 200);
}

export async function listFavoriteDocuments(): Promise<AppDocument[]> {
  return delay(mockDocuments.filter((doc) => doc.favorite));
}

export async function toggleFavorite(_id: string): Promise<void> {
  return delay(undefined, 150);
}
