"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BrainCircuit, FileSearch, Layers, Sparkles, Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { easePremium } from "@/lib/motion";

const stages = [
  { label: "Understanding your question", icon: BrainCircuit },
  { label: "Searching document", icon: FileSearch },
  { label: "Retrieving relevant context", icon: Layers },
  { label: "Generating answer", icon: Sparkles },
];

/** A meaningful retrieval/"thinking" state — communicates real RAG work, not a spinner. */
export function RetrievalIndicator() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (stageIndex >= stages.length - 1) return;
    const timer = setTimeout(() => setStageIndex((i) => i + 1), 650);
    return () => clearTimeout(timer);
  }, [stageIndex]);

  return (
    <div className="flex items-start gap-3">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-intel/10 text-intel">
          <Sparkles className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-[240px] flex-col gap-1.5 rounded-xl border border-border bg-muted/50 px-4 py-3">
        {stages.map((stage, i) => {
          if (i > stageIndex) return null;
          const isCurrent = i === stageIndex;
          const Icon = stage.icon;
          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: isCurrent ? 1 : 0.45, y: 0 }}
              transition={{ duration: 0.3, ease: easePremium }}
              className="flex items-center gap-2.5 text-xs"
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                {i < stageIndex ? (
                  <Check className="size-3 text-signal" />
                ) : (
                  <Icon className={isCurrent ? "size-3.5 text-intel animate-pulse-dot" : "size-3.5"} />
                )}
              </span>
              <span className={isCurrent ? "font-medium text-foreground" : "text-muted-foreground"}>
                {stage.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function RetrievalInline() {
  const [stageIndex, setStageIndex] = useState(0);
  useEffect(() => {
    if (stageIndex >= stages.length - 1) return;
    const timer = setTimeout(() => setStageIndex((i) => i + 1), 550);
    return () => clearTimeout(timer);
  }, [stageIndex]);

  const stage = stages[stageIndex];
  const Icon = stage.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={stage.label}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-intel"
      >
        <Icon className="size-3 animate-pulse-dot" /> {stage.label}
      </motion.span>
    </AnimatePresence>
  );
}
