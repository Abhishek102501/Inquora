"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadCloud, FileWarning, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadItemRow } from "@/components/upload/upload-item-row";
import { easePremium } from "@/lib/motion";
import * as documentsApi from "@/lib/api/documents";
import { ApiError } from "@/lib/api/client";
import type { UploadingFile } from "@/types";
import { cn } from "cn";

const MAX_SIZE_BYTES = 25 * 1024 * 1024;
const POLL_INTERVAL_MS = 2000;

export function UploadManager() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Local upload id -> the underlying File, kept in a ref since it's only
  // ever read from event handlers (retry), never during render.
  const filesById = useRef<Map<string, File>>(new Map());
  // Local upload id -> the real backend document id, once upload succeeds.
  // This one IS read during render (to link "Start chatting" to the first
  // ready document), so it must be state, not a ref, to stay reactive.
  const [documentIdById, setDocumentIdById] = useState<Record<string, string>>({});
  const pollTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  function update(id: string, patch: Partial<UploadingFile>) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  const pollStatus = useCallback((localId: string, documentId: string) => {
    async function tick() {
      try {
        const status = await documentsApi.getDocumentStatus(documentId);
        if (status.status === "ready") {
          update(localId, { state: "success", progress: 100 });
          return;
        }
        if (status.status === "error") {
          update(localId, {
            state: "error",
            errorMessage: status.errorMessage ?? "Processing failed.",
          });
          return;
        }
        pollTimers.current.set(localId, setTimeout(tick, POLL_INTERVAL_MS));
      } catch {
        pollTimers.current.set(localId, setTimeout(tick, POLL_INTERVAL_MS));
      }
    }
    tick();
  }, []);

  const startUpload = useCallback(
    (localId: string, file: File) => {
      filesById.current.set(localId, file);
      documentsApi
        .uploadDocument(file, (percent) => update(localId, { progress: percent }))
        .then((doc) => {
          setDocumentIdById((prev) => ({ ...prev, [localId]: doc.id }));
          update(localId, { state: "processing", progress: 100 });
          pollStatus(localId, doc.id);
        })
        .catch((err) => {
          const message = err instanceof ApiError ? err.message : "Upload failed.";
          update(localId, { state: "error", errorMessage: message });
        });
    },
    [pollStatus],
  );

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const incoming = Array.from(list);
      const next: UploadingFile[] = [];

      for (const file of incoming) {
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const id = `up_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

        if (!isPdf) {
          next.push({
            id,
            name: file.name,
            sizeBytes: file.size,
            progress: 0,
            state: "error",
            errorMessage: "Only PDF files are supported.",
          });
          continue;
        }
        if (file.size > MAX_SIZE_BYTES) {
          next.push({
            id,
            name: file.name,
            sizeBytes: file.size,
            progress: 0,
            state: "error",
            errorMessage: "File exceeds the 25 MB limit.",
          });
          continue;
        }

        next.push({ id, name: file.name, sizeBytes: file.size, progress: 0, state: "uploading" });
        setTimeout(() => startUpload(id, file), 0);
      }

      setFiles((prev) => [...next, ...prev]);
    },
    [startUpload],
  );

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  function handleRemove(id: string) {
    clearTimeout(pollTimers.current.get(id));
    pollTimers.current.delete(id);
    filesById.current.delete(id);
    setDocumentIdById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleRetry(id: string) {
    const file = filesById.current.get(id);
    if (!file) return;
    update(id, { state: "uploading", progress: 0, errorMessage: undefined });
    startUpload(id, file);
  }

  const successCount = files.filter((f) => f.state === "success").length;
  const hasActive = files.some((f) => f.state === "uploading" || f.state === "processing");
  const firstReadySuccess = files.find((f) => f.state === "success");
  const firstReadyDocumentId = firstReadySuccess
    ? documentIdById[firstReadySuccess.id]
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-4 py-10 text-center transition-all duration-300 sm:px-6 sm:py-16",
          dragActive
            ? "scale-[1.01] border-signal bg-signal/5 shadow-lg"
            : "border-border hover:border-signal/40 hover:bg-muted/40",
        )}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-[0.035]" />
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <motion.div
          animate={dragActive ? { scale: 1.12, y: -4 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: easePremium }}
          className="flex size-14 items-center justify-center rounded-full bg-signal/10 text-signal"
        >
          <UploadCloud className="size-6" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.h3
            key={dragActive ? "release" : "drop"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-4 font-serif text-lg font-semibold"
          >
            {dragActive ? "Release to add documents" : "Drop your PDFs here"}
          </motion.h3>
        </AnimatePresence>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          or click to browse — supports multiple files, up to 25 MB each
        </p>
        <Button className="mt-4 bg-signal text-signal-foreground hover:bg-signal/90" type="button">
          Browse files
        </Button>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              {files.length} file{files.length === 1 ? "" : "s"}
            </h4>
            {files.some((f) => f.state === "error") && (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <FileWarning className="size-3.5" /> Some files need attention
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, ease: easePremium }}
                >
                  <UploadItemRow file={file} onRemove={handleRemove} onRetry={handleRetry} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {successCount > 0 && !hasActive && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easePremium }}
          className="flex items-center justify-between rounded-lg border border-signal/20 bg-signal/5 px-4 py-3"
        >
          <p className="text-sm text-signal">
            {successCount} document{successCount === 1 ? "" : "s"} ready to ask questions about.
          </p>
          <Button
            size="sm"
            className="bg-signal text-signal-foreground hover:bg-signal/90"
            onClick={() => {
              if (firstReadyDocumentId) {
                router.push(`/chat?document=${firstReadyDocumentId}`);
              } else {
                toast.info("Open Documents to start a conversation.");
                router.push("/documents");
              }
            }}
          >
            Start chatting <ArrowRight className="size-3.5" />
          </Button>
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground">
        Need to review your library instead? <Link href="/documents" className="text-signal hover:underline">Go to documents</Link>.
      </p>
    </div>
  );
}
