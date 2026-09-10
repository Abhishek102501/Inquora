import { cn } from "cn";

export function AIStatusIndicator({
  label = "AI active",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-intel/25 bg-intel/8 px-2.5 py-1 font-mono text-[11px] text-intel",
        className,
      )}
    >
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full rounded-full bg-intel animate-pulse-dot" />
      </span>
      {label}
    </span>
  );
}
