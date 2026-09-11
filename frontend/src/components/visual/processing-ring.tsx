import { cn } from "cn";

/** A meaningful "in progress" indicator — an animated ring rather than a generic spinner. */
export function ProcessingRing({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Processing"
    >
      <svg viewBox="0 0 24 24" className="animate-spin-slow" width={size} height={size}>
        <circle
          cx="12"
          cy="12"
          r="9.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="2.5"
        />
        <path
          d="M12 2.5 A9.5 9.5 0 0 1 21.5 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute size-1.5 rounded-full bg-current animate-pulse-dot" />
    </span>
  );
}
