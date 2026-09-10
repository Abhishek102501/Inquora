"use client";

import { motion } from "motion/react";
import { FileText, MessagesSquare, Plus, Search, Sparkles } from "lucide-react";
import { viewportOnce, easePremium } from "@/lib/motion";

const sidebarDocs = [
  { name: "Attention Is All You Need.pdf", active: true },
  { name: "Q3-2026-Board-Deck.pdf", active: false },
  { name: "Clinical-Trial-Results.pdf", active: false },
];

const sources = [
  { page: 5, snippet: "We employ h = 8 parallel attention layers, or heads." },
  { page: 8, snippet: "The Transformer achieves a new state of the art BLEU score." },
  { page: 12, snippet: "Table 3 shows the effect of varying attention heads." },
];

export function WorkspacePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, ease: easePremium }}
      className="glow-border relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]"
    >
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        <span className="size-2.5 rounded-full bg-highlight-foreground/30" />
        <span className="size-2.5 rounded-full bg-signal/40" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground">Inqora — Workspace</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px]">
        <div className="hidden flex-col gap-1 border-r border-border p-3 lg:flex">
          <button className="mb-2 flex items-center gap-2 rounded-md bg-signal/10 px-2.5 py-1.5 text-xs font-medium text-signal">
            <Plus className="size-3.5" /> New chat
          </button>
          <p className="px-2.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Documents
          </p>
          {sidebarDocs.map((doc) => (
            <div
              key={doc.name}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${
                doc.active ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
            >
              <FileText className="size-3 shrink-0 opacity-70" />
              <span className="truncate">{doc.name}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
            <Search className="size-3.5" />
            Attention Is All You Need.pdf
          </div>

          <div className="flex flex-col gap-4">
            <div className="ml-auto max-w-[85%] rounded-xl bg-signal px-4 py-2.5 text-sm text-signal-foreground">
              What dataset did the paper use to evaluate translation quality?
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-signal/10 text-signal">
                <Sparkles className="size-3.5" />
              </span>
              <div className="max-w-[85%] rounded-xl bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">
                The paper evaluates the model using the WMT 2014 English-to-German and
                English-to-French translation tasks, reporting BLEU scores against prior
                architectures.
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sources.map((s, i) => (
                    <span
                      key={s.page}
                      className="flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                    >
                      <span className="flex size-3.5 items-center justify-center rounded-sm bg-highlight text-[8px] font-semibold text-highlight-foreground">
                        {i + 1}
                      </span>
                      Pg {s.page}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
              <MessagesSquare className="size-3.5" />
              Ask a follow-up question…
            </div>
          </div>
        </div>

        <div className="hidden flex-col gap-2 border-l border-border p-4 lg:flex">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Sources
          </p>
          {sources.map((s) => (
            <div key={s.page} className="rounded-lg border border-border bg-muted/30 p-2.5">
              <p className="font-mono text-[10px] font-medium text-signal">PAGE {s.page}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                {s.snippet}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
