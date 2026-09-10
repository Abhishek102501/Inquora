"use client";

import { FadeIn } from "@/components/visual/fade-in";
import { viewportOnce } from "@/lib/motion";
import { motion } from "motion/react";

const pillars = [
  {
    index: "01",
    title: "Grounded",
    description: "Answers are generated from retrieved document context — not memory, not guesswork.",
  },
  {
    index: "02",
    title: "Verifiable",
    description: "Every important claim can point back to the exact page it came from.",
  },
  {
    index: "03",
    title: "Context-aware",
    description: "Ask follow-up questions without losing the thread of the conversation.",
  },
];

export function WhyInqora() {
  return (
    <section id="capabilities" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <FadeIn className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-signal">Why Inqora</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
          Built for people who need to trust the answer.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Every answer should be traceable back to the document.
        </p>
      </FadeIn>

      <div className="mt-14 flex flex-col divide-y divide-border border-y border-border">
        {pillars.map((pillar, i) => (
          <motion.div
            key={pillar.index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group grid grid-cols-1 items-baseline gap-3 py-8 transition-colors duration-300 sm:grid-cols-[100px_1fr] sm:gap-8 md:py-10"
          >
            <span className="font-mono text-sm text-muted-foreground/60">{pillar.index}</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
              <h3 className="font-serif text-3xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-signal sm:w-56 sm:shrink-0 md:text-4xl">
                {pillar.title}
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
