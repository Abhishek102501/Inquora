import { cn } from "cn";

export function AnimatedDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-px w-full overflow-hidden bg-border", className)}>
      <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-intel/60 to-transparent animate-shimmer" />
    </div>
  );
}
