import { cn } from "cn";

/** Low-contrast radial lighting used behind hero/section content. Purely decorative. */
export function Spotlight({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute -z-10", className)}
      style={{
        background:
          "radial-gradient(closest-side, color-mix(in oklab, var(--intel) 22%, transparent), transparent 70%)",
        filter: "blur(40px)",
      }}
    />
  );
}

export function KnowledgeGraphBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-fine-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_40%,transparent_100%)]" />
      <Spotlight className="left-1/4 top-[-10%] size-[520px]" />
      <Spotlight className="right-[-10%] top-[10%] size-[420px]" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.5]"
        viewBox="0 0 1200 700"
        preserveAspectRatio="none"
      >
        <g stroke="var(--border)" strokeWidth="1" fill="none">
          <path d="M100 120 L340 220 L560 140 L820 260" />
          <path d="M180 420 L420 330 L660 460 L940 360" />
          <path d="M60 560 L300 500 L520 600" />
        </g>
        <g fill="var(--intel)" opacity="0.55">
          <circle cx="100" cy="120" r="3" />
          <circle cx="340" cy="220" r="3" />
          <circle cx="560" cy="140" r="3" />
          <circle cx="820" cy="260" r="3" />
          <circle cx="420" cy="330" r="3" />
          <circle cx="660" cy="460" r="3" />
          <circle cx="940" cy="360" r="3" />
        </g>
      </svg>
    </div>
  );
}
