"use client";

import { useCallback, useEffect, useState } from "react";
import * as conversationsApi from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/client";
import type { Conversation } from "@/types";
import type { FetchState } from "@/hooks/use-documents";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const items = await conversationsApi.listConversations();
      setConversations(items);
      setState(items.length === 0 ? "empty" : "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load conversations.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend on mount; there is no framework-level data loader in this client-rendered app
    refresh();
  }, [refresh]);

  const removeConversation = useCallback(async (id: string) => {
    await conversationsApi.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { conversations, state, error, refresh, removeConversation };
}
