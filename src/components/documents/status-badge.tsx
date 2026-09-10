import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "cn";
import type { DocumentStatus } from "@/types";
import { ProcessingRing } from "@/components/visual/processing-ring";

const config: Record<DocumentStatus, { label: string; className: string }> = {
  ready: {
    label: "Ready",
    className: "bg-signal/10 text-signal border-signal/20",
  },
  processing: {
    label: "Processing",
    className: "bg-intel/10 text-intel border-intel/20",
  },
  queued: {
    label: "Queued",
    className: "bg-muted text-muted-foreground border-border",
  },
  error: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, className } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {status === "ready" && <CheckCircle2 className="size-3" />}
      {status === "processing" && <ProcessingRing size={11} />}
      {status === "queued" && <Clock className="size-3" />}
      {status === "error" && <XCircle className="size-3" />}
      {label}
    </span>
  );
}
