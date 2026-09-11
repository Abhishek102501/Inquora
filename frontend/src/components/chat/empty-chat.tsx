import { Sparkles } from "lucide-react";
import { StaggerGroup, StaggerItem, FadeIn } from "@/components/visual/fade-in";
import { scaleIn } from "@/lib/motion";

const suggestions = [
  "What is the main conclusion of this paper?",
  "Summarize the key points in plain language",
  "Are there any risks or caveats mentioned?",
  "What page discusses the methodology?",
];

export function EmptyChat({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <FadeIn viewport={false} variants={scaleIn}>
        <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-intel/15 to-signal/15 text-signal">
          <Sparkles className="size-5" />
        </div>
      </FadeIn>
      <FadeIn viewport={false} delay={0.1}>
        <h3 className="mt-4 font-serif text-xl font-semibold">Ask anything about your documents</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Inqora reads every page and answers with the exact citation it came from.
        </p>
      </FadeIn>
      <StaggerGroup
        viewport={false}
        delay={0.25}
        stagger={0.06}
        className="mt-6 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {suggestions.map((s) => (
          <StaggerItem key={s}>
            <button
              onClick={() => onSuggestion(s)}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-left text-sm text-foreground/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-signal/40 hover:bg-signal/5 hover:text-foreground hover:shadow-sm"
            >
              {s}
            </button>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
