import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "cn";
import { FadeIn } from "@/components/visual/fade-in";
import { DocumentStack } from "@/components/visual/document-stack";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  illustration?: "icon" | "documents";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  illustration = "icon",
}: EmptyStateProps) {
  return (
    <FadeIn
      viewport={false}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-[0.035]" />
      {illustration === "documents" ? (
        <DocumentStack />
      ) : (
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      )}
      <h3 className="mt-4 font-serif text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </FadeIn>
  );
}
