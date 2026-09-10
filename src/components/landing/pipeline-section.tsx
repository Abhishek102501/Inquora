"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { FileInput, Layers, SearchCode, Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import { easePremium } from "@/lib/motion";
import { cn } from "cn";

interface Stage {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const stages: Stage[] = [
  { index: "01", title: "Ingest", description: "PDF enters the system", icon: FileInput },
  { index: "02", title: "Understand", description: "Pages become structured semantic chunks", icon: Layers },
  { index: "03", title: "Retrieve", description: "Relevant context is found using vector search", icon: SearchCode },
  { index: "04", title: "Generate", description: "The model produces a grounded answer", icon: Sparkles },
  { index: "05", title: "Verify", description: "Sources let you verify the answer", icon: ShieldCheck },
];

function PipelineStage({ stage, index, isLast }: { stage: Stage; index: number; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const Icon = stage.icon;

  return (
    <div ref={ref} className="relative flex flex-1 flex-col gap-4 lg:pr-6">
      {!isLast && (
        <div className="absolute left-6 top-6 hidden h-px w-full overflow-hidden bg-border lg:block">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.6, ease: easePremium, delay: 0.15 }}
            style={{ transformOrigin: "left" }}
            className="h-full bg-signal/60"
          />
        </div>
      )}
      {!isLast && (
        <div className="ml-6 h-8 w-px bg-border lg:hidden" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easePremium, delay: index * 0.05 }}
        className="flex flex-col gap-3"
      >
        <span
          className={cn(
            "relative z-10 flex size-12 items-center justify-center rounded-full border-2 bg-background transition-colors duration-500",
            inView ? "border-signal text-signal" : "border-border text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
          {inView && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-signal"
            />
          )}
        </span>
        <div>
          <p className="font-mono text-[11px] text-signal">{stage.index}</p>
          <p className="mt-1 font-serif text-lg font-semibold">{stage.title}</p>
          <p className="mt-1 max-w-[220px] text-sm text-muted-foreground">{stage.description}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function PipelineSection() {
  return (
    <section id="how-it-works" className="border-y border-border bg-muted/20 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-signal">How it works</p>
        <h2 className="mt-3 max-w-lg font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          From document to answer
        </h2>
        <div className="mt-14 flex flex-col gap-8 lg:flex-row lg:gap-0">
          {stages.map((stage, i) => (
            <PipelineStage key={stage.title} stage={stage} index={i} isLast={i === stages.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
