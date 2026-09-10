export type DocumentStatus = "processing" | "ready" | "error" | "queued";

export interface AppDocument {
  id: string;
  name: string;
  pages: number;
  sizeBytes: number;
  uploadedAt: string; // ISO date string
  status: DocumentStatus;
  summary?: string;
  thumbnailColor?: string;
  errorMessage?: string;
  favorite?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  documentIds: string[];
}

export interface SourceCitation {
  id: string;
  documentId: string;
  documentName: string;
  page: number;
  snippet: string;
}

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  sources?: SourceCitation[];
  status?: "sending" | "streaming" | "complete" | "error" | "no-answer";
}

export interface Conversation {
  id: string;
  title: string;
  documentIds: string[];
  lastMessage: string;
  updatedAt: string;
  createdAt: string;
  messageCount: number;
}

export interface UploadingFile {
  id: string;
  name: string;
  sizeBytes: number;
  progress: number;
  state: "uploading" | "processing" | "success" | "error";
  errorMessage?: string;
}
