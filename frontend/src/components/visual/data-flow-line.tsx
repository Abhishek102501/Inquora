import { cn } from "cn";

/** Animated vertical dashed connector used to link stages in a process diagram. */
export function DataFlowLine({ className, height = 28 }: { className?: string; height?: number }) {
  return (
    <svg
      aria-hidden="true"
      width="2"
      height={height}
      viewBox={`0 0 2 ${height}`}
      className={cn("mx-auto text-intel/50", className)}
    >
      <line
        x1="1"
        y1="0"
        x2="1"
        y2={height}
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
        className="animate-dash-flow"
      />
    </svg>
  );
}

export function DataFlowLineHorizontal({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={cn("h-px w-full text-intel/40", className)} viewBox="0 0 100 1" preserveAspectRatio="none">
      <line
        x1="0"
        y1="0.5"
        x2="100"
        y2="0.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        className="animate-dash-flow"
      />
    </svg>
  );
}
