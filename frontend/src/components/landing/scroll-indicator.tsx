"use client";

import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export function ScrollIndicator({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      aria-label="Scroll to next section"
      className="group mx-auto flex flex-col items-center gap-1.5 pb-6 text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em]">Scroll</span>
      <motion.span
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="size-4" />
      </motion.span>
    </a>
  );
}
