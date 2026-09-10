import { FileText, CheckCircle2, XCircle, RotateCcw, X, ScanText, Layers, BrainCircuit, Database } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ProcessingRing } from "@/components/visual/processing-ring";
import { formatBytes } from "@/lib/format";
import type { UploadingFile } from "@/types";
import { cn } from "cn";

const indexingStages = [
  { threshold: 25, label: "Extracting text", icon: ScanText },
  { threshold: 55, label: "Chunking content", icon: Layers },
  { threshold: 80, label: "Embedding vectors", icon: BrainCircuit },
  { threshold: 101, label: "Indexing", icon: Database },
];

function stageForProgress(progress: number) {
  return indexingStages.find((s) => progress < s.threshold) ?? indexingStages[indexingStages.length - 1];
}

export function UploadItemRow({
  file,
  onRemove,
  onRetry,
}: {
  file: UploadingFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const stage = file.state === "processing" ? stageForProgress(file.progress) : null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-300">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors duration-300",
          file.state === "error" ? "bg-destructive/10 text-destructive" : "bg-signal/10 text-signal",
        )}
      >
        <FileText className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</span>
        </div>

        {file.state === "uploading" || file.state === "processing" ? (
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={file.progress} className="h-1.5" />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {file.progress}%
            </span>
          </div>
        ) : (
          <p
            className={cn(
              "mt-0.5 text-xs",
              file.state === "success" && "text-signal",
              file.state === "error" && "text-destructive",
            )}
          >
            {file.state === "error" && file.errorMessage
              ? file.errorMessage
              : "Your document is ready to query."}
          </p>
        )}

        {file.state === "processing" && stage && (
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-intel"
            >
              <stage.icon className="size-3" />
              {stage.label}…
            </motion.div>
          </AnimatePresence>
        )}
        {file.state === "uploading" && (
          <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">Uploading…</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {file.state === "uploading" || file.state === "processing" ? (
          <ProcessingRing className="text-intel" size={16} />
        ) : file.state === "success" ? (
          <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
            <CheckCircle2 className="size-4 text-signal" />
          </motion.span>
        ) : (
          <>
            <XCircle className="size-4 text-destructive" />
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={`Retry ${file.name}`}
              onClick={() => onRetry(file.id)}
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`Remove ${file.name}`}
          onClick={() => onRemove(file.id)}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
