"use client";

import { motion } from "motion/react";
import { viewportOnce } from "@/lib/motion";

const columns = [
  { label: "Documents", nodes: 2 },
  { label: "Chunks", nodes: 4 },
  { label: "Embeddings", nodes: 4 },
  { label: "Retrieval", nodes: 3 },
  { label: "Answer", nodes: 1 },
];

export function KnowledgeNetwork() {
  const colWidth = 100 / (columns.length - 1);

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <svg viewBox="0 0 800 220" className="h-auto w-full overflow-visible" aria-hidden="true">
        {columns.slice(0, -1).map((col, colIndex) => {
          const x1 = (colIndex * colWidth * 8) + 40;
          const x2 = ((colIndex + 1) * colWidth * 8) + 40;
          const fromNodes = columns[colIndex].nodes;
          const toNodes = columns[colIndex + 1].nodes;
          const lines = [];
          for (let f = 0; f < fromNodes; f++) {
            for (let t = 0; t < toNodes; t++) {
              const y1 = 30 + f * (160 / Math.max(fromNodes - 1, 1));
              const y2 = 30 + t * (160 / Math.max(toNodes - 1, 1));
              lines.push(
                <motion.line
                  key={`${colIndex}-${f}-${t}`}
                  x1={x1}
                  y1={fromNodes === 1 ? 110 : y1}
                  x2={x2}
                  y2={toNodes === 1 ? 110 : y2}
                  stroke="var(--border)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.6 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.8, delay: colIndex * 0.15, ease: "easeInOut" }}
                />,
              );
            }
          }
          return lines;
        })}

        {columns.map((col, colIndex) => {
          const x = colIndex * colWidth * 8 + 40;
          return Array.from({ length: col.nodes }).map((_, n) => {
            const y = col.nodes === 1 ? 110 : 30 + n * (160 / Math.max(col.nodes - 1, 1));
            return (
              <motion.circle
                key={`node-${colIndex}-${n}`}
                cx={x}
                cy={y}
                r={colIndex === columns.length - 1 ? 7 : 5}
                fill={colIndex === columns.length - 1 ? "var(--signal)" : "var(--intel)"}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={viewportOnce}
                transition={{ duration: 0.4, delay: colIndex * 0.15 + n * 0.05, ease: "easeOut" }}
              />
            );
          });
        })}
      </svg>

      <div className="mt-2 grid grid-cols-5 gap-2 text-center">
        {columns.map((col) => (
          <p key={col.label} className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">
            {col.label}
          </p>
        ))}
      </div>
    </div>
  );
}
