import { FileText } from "lucide-react";
import { cn } from "cn";

/** Layered document illustration used in empty states and the upload dropzone. */
export function DocumentStack({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex h-16 w-16 items-center justify-center", className)} aria-hidden="true">
      <span className="absolute size-11 -rotate-6 rounded-md border border-border bg-card shadow-sm" />
      <span className="absolute size-11 rotate-3 rounded-md border border-border bg-card shadow-sm" />
      <span className="relative flex size-11 items-center justify-center rounded-md border border-signal/25 bg-signal/10 text-signal shadow-sm">
        <FileText className="size-5" />
      </span>
    </div>
  );
}
