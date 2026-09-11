import { mockCollections } from "@/data/mock-collections";
import type { Collection } from "@/types";

// NOTE: Mock-backed for now. Replace with FastAPI calls later, e.g.
// GET /api/collections, POST /api/collections, PATCH /api/collections/:id.

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function listCollections(): Promise<Collection[]> {
  return delay([...mockCollections]);
}

export async function getCollection(id: string): Promise<Collection | undefined> {
  return delay(mockCollections.find((c) => c.id === id));
}
