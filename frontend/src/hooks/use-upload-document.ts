"use client";

import { useCallback, useState } from "react";
import * as documentsApi from "@/lib/api/documents";
import { ApiError } from "@/lib/api/client";
import type { UploadingFile } from "@/types";

const MAX_SIZE_BYTES = 25 * 1024 * 1024;

export function useUploadDocument() {
  const [files, setFiles] = useState<UploadingFile[]>([]);

  const upload = useCallback((file: File) => {
    const id = `up_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (!file.name.toLowerCase().endsWith(".pdf") || file.type !== "application/pdf") {
      setFiles((prev) => [
        {
          id,
          name: file.name,
          sizeBytes: file.size,
          progress: 0,
          state: "error",
          errorMessage: "Only PDF files are supported.",
        },
        ...prev,
      ]);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFiles((prev) => [
        {
          id,
          name: file.name,
          sizeBytes: file.size,
          progress: 0,
          state: "error",
          errorMessage: "File exceeds the 25 MB limit.",
        },
        ...prev,
      ]);
      return;
    }

    setFiles((prev) => [
      { id, name: file.name, sizeBytes: file.size, progress: 0, state: "uploading" },
      ...prev,
    ]);

    documentsApi
      .uploadDocument(file, (percent) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: percent } : f)),
        );
      })
      .then(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: 100, state: "processing" } : f)),
        );
      })
      .catch((err) => {
        const message = err instanceof ApiError ? err.message : "Upload failed.";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, state: "error", errorMessage: message } : f,
          ),
        );
      });

    return id;
  }, []);

  const markReady = useCallback((id: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, state: "success" } : f)));
  }, []);

  const markFailed = useCallback((id: string, errorMessage: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, state: "error", errorMessage } : f)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const retry = useCallback(
    (id: string, file: File) => {
      remove(id);
      upload(file);
    },
    [remove, upload],
  );

  return { files, upload, markReady, markFailed, remove, retry };
}
