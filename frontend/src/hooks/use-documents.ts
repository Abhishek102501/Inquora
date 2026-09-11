"use client";

import { useCallback, useEffect, useState } from "react";
import * as documentsApi from "@/lib/api/documents";
import { ApiError } from "@/lib/api/client";
import type { AppDocument } from "@/types";

export type FetchState = "idle" | "loading" | "success" | "empty" | "error";

export function useDocuments() {
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const items = await documentsApi.listDocuments();
      setDocuments(items);
      setState(items.length === 0 ? "empty" : "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load documents.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend on mount; there is no framework-level data loader in this client-rendered app
    refresh();
  }, [refresh]);

  const removeDocument = useCallback(async (id: string) => {
    await documentsApi.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { documents, state, error, refresh, removeDocument };
}

export function useDocumentStatus(id: string | null, intervalMs = 2500) {
  const [status, setStatus] = useState<documentsApi.DocumentStatusResult | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const result = await documentsApi.getDocumentStatus(id!);
        if (cancelled) return;
        setStatus(result);
        if (result.status === "processing" || result.status === "queued") {
          timer = setTimeout(poll, intervalMs);
        }
      } catch {
        // Transient poll failure — try again on the next interval rather
        // than surfacing a hard error for a background status check.
        if (!cancelled) timer = setTimeout(poll, intervalMs);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, intervalMs]);

  return status;
}
