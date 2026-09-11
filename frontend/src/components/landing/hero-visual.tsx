"use client";

import { motion } from "motion/react";
import { FileText, Search, Layers, Sparkles, Quote, Radio } from "lucide-react";
import { DataFlowLine } from "@/components/visual/data-flow-line";
import { AIStatusIndicator } from "@/components/visual/ai-status-indicator";
import { easePremium } from "@/lib/motion";

const pages = [5, 8, 12];

export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: easePremium, delay: 0.2 }}
      className="relative w-full"
    >
      <div className="glow-border relative overflow-hidden rounded-2xl border border-border bg-card/90 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-7">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-fine-grid opacity-[0.15]" />

        <div className="flex items-center justify-between gap-2 border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-signal/10 text-signal">
              <FileText className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight">Attention Is All You Need.pdf</p>
              <p className="font-mono text-[11px] text-muted-foreground">62 pages</p>
            </div>
          </div>
          <AIStatusIndicator className="shrink-0" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: easePremium, delay: 0.5 }}
          className="mt-5 flex items-center gap-2.5"
        >
          <span className="relative flex size-7 shrink-0 items-center justify-center rounded-md bg-intel/10 text-intel">
            <Search className="size-3.5" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-intel animate-pulse-dot" />
          </span>
          <div>
            <p className="text-sm font-medium">Retrieving context</p>
            <p className="flex items-center gap-1.5 font-mono text-[11px] text-intel">
              <Radio className="size-2.5" /> Searching semantic embeddings
            </p>
          </div>
        </motion.div>

        <DataFlowLine height={20} className="ml-3.5" />

        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: easePremium, delay: 0.85 }}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-intel/10 text-intel">
              <Layers className="size-3.5" />
            </span>
            <p className="text-sm font-medium">Relevant passages found</p>
          </div>
          <div className="ml-9 mt-2 flex flex-wrap gap-1.5">
            {pages.map((p, i) => (
              <motion.span
                key={p}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.05 + i * 0.12, ease: easePremium }}
                className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground"
              >
                Page {p}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <DataFlowLine height={20} className="ml-3.5" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easePremium, delay: 1.5 }}
          className="relative overflow-hidden rounded-lg border border-signal/20 bg-signal/5 p-4"
        >
          <div className="flex items-center gap-2 text-signal">
            <Sparkles className="size-3.5" />
            <p className="font-mono text-[11px] uppercase tracking-wide">Grounded answer</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            The Transformer architecture relies entirely on <strong>self-attention</strong>, using
            8 parallel heads to relate positions across the input and output sequences.
          </p>
          <motion.div
            aria-hidden="true"
            animate={{ x: ["-120%", "220%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear", repeatDelay: 1.4 }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-signal/10 to-transparent"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easePremium, delay: 1.9 }}
          className="mt-4"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Sources</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {pages.map((p, i) => (
              <span
                key={p}
                className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground"
              >
                <span className="flex size-3.5 items-center justify-center rounded-sm bg-highlight text-[8px] font-semibold text-highlight-foreground">
                  {i + 1}
                </span>
                <Quote className="size-2.5" /> Page {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 -top-4 hidden size-16 items-center justify-center rounded-xl border border-border bg-card shadow-md sm:flex"
      >
        <FileText className="size-6 text-signal" />
      </motion.div>
    </motion.div>
  );
}
