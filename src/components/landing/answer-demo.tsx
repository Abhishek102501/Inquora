"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { FadeIn } from "@/components/visual/fade-in";
import { cn } from "cn";

const sources = [
  {
    id: "s1",
    page: 8,
    phrase: "WMT 2014 English-to-German and English-to-French",
    snippet:
      "On the WMT 2014 English-to-German translation task, the Transformer establishes a new state of the art BLEU score of 28.4.",
  },
  {
    id: "s2",
    page: 12,
    phrase: "8 attention heads",
    snippet:
      "In this work we employ h = 8 parallel attention layers, or heads, each operating on a 64-dimensional projection.",
  },
];

const answerParts = [
  "The paper evaluates the model using the ",
  { phrase: "WMT 2014 English-to-German and English-to-French", sourceId: "s1" },
  " translation benchmarks. The base architecture uses ",
  { phrase: "8 attention heads", sourceId: "s2" },
  " across its encoder and decoder stacks.",
] as const;

export function AnswerDemo() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="verify" className="mx-auto w-full max-w-5xl px-4 py-20 md:px-8 md:py-28">
      <FadeIn className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-signal">For researchers</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          See the answer behind the answer
        </h2>
        <p className="mt-3 text-muted-foreground">
          Hover a source to see exactly where it grounds the answer.
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="ml-auto max-w-md rounded-xl bg-signal px-4 py-2.5 text-sm text-signal-foreground">
          What dataset did the paper use?
        </div>

        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-foreground">
          {answerParts.map((part, i) =>
            typeof part === "string" ? (
              <span key={i}>{part}</span>
            ) : (
              <span
                key={i}
                onMouseEnter={() => setActive(part.sourceId)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(part.sourceId)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                className={cn(
                  "cursor-pointer rounded-sm px-0.5 font-medium underline decoration-dotted decoration-signal/40 underline-offset-4 transition-colors duration-200",
                  active === part.sourceId ? "bg-highlight text-highlight-foreground" : "text-signal",
                )}
              >
                {part.phrase}
              </span>
            ),
          )}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sources.map((source, i) => {
            const isActive = active === source.id;
            return (
              <button
                key={source.id}
                onMouseEnter={() => setActive(source.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(source.id)}
                onBlur={() => setActive(null)}
                onClick={() => setActive((cur) => (cur === source.id ? null : source.id))}
                className={cn(
                  "flex flex-col gap-1.5 rounded-lg border p-3.5 text-left transition-all duration-250",
                  isActive
                    ? "-translate-y-0.5 border-signal/40 bg-signal/5 shadow-md"
                    : "border-border bg-muted/30 hover:border-signal/20",
                )}
              >
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-signal">
                  <motion.span
                    animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className="flex size-4 items-center justify-center rounded-sm bg-highlight text-[9px] font-semibold text-highlight-foreground"
                  >
                    {i + 1}
                  </motion.span>
                  SOURCE &middot; PAGE {source.page}
                </div>
                <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                  <Quote className="mt-0.5 size-3 shrink-0 text-highlight-foreground/70" />
                  {source.snippet}
                </p>
              </button>
            );
          })}
        </div>
      </FadeIn>
    </section>
  );
}
