"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { easePremium } from "@/lib/motion";

interface RevealTextProps {
  children: string;
  as?: ElementType;
  className?: string;
  by?: "word" | "line";
  delay?: number;
  stagger?: number;
}

/** Word-by-word blur-to-sharp reveal for headings. Splits text into spans. */
export function RevealText({
  children,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.045,
}: RevealTextProps) {
  const words = children.split(" ");

  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
        className="inline"
        aria-label={children}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.5, ease: easePremium },
              },
            }}
            className="inline-block will-change-transform"
            aria-hidden="true"
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

export function FadeUpText({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easePremium, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
