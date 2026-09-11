import { FileText, CheckCircle2, XCircle, RotateCcw, X, BrainCircuit } from "lucide-react";
import { motion } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ProcessingRing } from "@/components/visual/processing-ring";
import { formatBytes } from "@/lib/format";
import type { UploadingFile } from "@/types";
import { cn } from "cn";

export function UploadItemRow({
  file,
  onRemove,
  onRetry,
}: {
  file: UploadingFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
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

        {file.state === "uploading" ? (
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={file.progress} className="h-1.5" />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {file.progress}%
            </span>
          </div>
        ) : file.state === "processing" ? (
          <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-intel">
            <BrainCircuit className="size-3" />
            Indexing document…
          </p>
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
