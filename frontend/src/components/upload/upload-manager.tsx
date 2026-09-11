"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { UploadCloud, FileWarning, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadItemRow } from "@/components/upload/upload-item-row";
import { easePremium } from "@/lib/motion";
import type { UploadingFile } from "@/types";
import { cn } from "cn";

const MAX_SIZE_BYTES = 25 * 1024 * 1024;

export function UploadManager() {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const runSimulation = useCallback((id: string) => {
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          if (f.state === "uploading") {
            const next = f.progress + Math.random() * 22 + 8;
            if (next >= 100) return { ...f, progress: 100, state: "processing" };
            return { ...f, progress: Math.round(next) };
          }
          if (f.state === "processing") {
            const next = f.progress + Math.random() * 30 + 15;
            if (next >= 100) {
              clearInterval(timers.current.get(id));
              timers.current.delete(id);
              return { ...f, progress: 100, state: "success" };
            }
            return { ...f, progress: Math.round(next) };
          }
          return f;
        }),
      );
    }, 450);
    timers.current.set(id, interval);
  }, []);

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
        setTimeout(() => runSimulation(id), 50);
      }

      setFiles((prev) => [...next, ...prev]);
    },
    [runSimulation],
  );

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  function handleRemove(id: string) {
    clearInterval(timers.current.get(id));
    timers.current.delete(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleRetry(id: string) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, state: "uploading", progress: 0, errorMessage: undefined } : f)));
    runSimulation(id);
  }

  const successCount = files.filter((f) => f.state === "success").length;
  const hasActive = files.some((f) => f.state === "uploading" || f.state === "processing");

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
            onClick={() => toast.success("This is a frontend preview — connect the backend to open a live chat.")}
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
