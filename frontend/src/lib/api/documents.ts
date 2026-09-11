import { request, uploadFile } from "@/lib/api/client";
import type { AppDocument, DocumentStatus } from "@/types";

interface BackendDocument {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  page_count: number | null;
  status: "uploaded" | "processing" | "ready" | "failed";
  processing_error: string | null;
  created_at: string;
  updated_at: string;
}

interface DocumentListResponse {
  items: BackendDocument[];
  total: number;
}

interface DocumentStatusResponse {
  id: string;
  status: BackendDocument["status"];
  page_count: number | null;
  processing_error: string | null;
}

// The backend's real processing states (uploaded/processing/ready/failed)
// are mapped onto the existing frontend DocumentStatus vocabulary
// (queued/processing/ready/error) so the already-designed StatusBadge and
// document components need no changes at all.
const STATUS_MAP: Record<BackendDocument["status"], DocumentStatus> = {
  uploaded: "queued",
  processing: "processing",
  ready: "ready",
  failed: "error",
};

function toAppDocument(doc: BackendDocument): AppDocument {
  return {
    id: doc.id,
    name: doc.original_filename,
    pages: doc.page_count ?? 0,
    sizeBytes: doc.file_size,
    uploadedAt: doc.created_at,
    status: STATUS_MAP[doc.status],
    errorMessage: doc.processing_error ?? undefined,
  };
}

export async function listDocuments(): Promise<AppDocument[]> {
  const data = await request<DocumentListResponse>("/documents");
  return data.items.map(toAppDocument);
}

export async function getDocument(id: string): Promise<AppDocument> {
  const doc = await request<BackendDocument>(`/documents/${id}`);
  return toAppDocument(doc);
}

export interface DocumentStatusResult {
  id: string;
  status: DocumentStatus;
  pages: number | null;
  errorMessage: string | null;
}

export async function getDocumentStatus(id: string): Promise<DocumentStatusResult> {
  const data = await request<DocumentStatusResponse>(`/documents/${id}/status`);
  return {
    id: data.id,
    status: STATUS_MAP[data.status],
    pages: data.page_count,
    errorMessage: data.processing_error,
  };
}

export async function deleteDocument(id: string): Promise<void> {
  await request<void>(`/documents/${id}`, { method: "DELETE" });
}

export function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<AppDocument> {
  return uploadFile<BackendDocument>("/documents/upload", file, onProgress).then(toAppDocument);
}
