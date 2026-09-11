"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { cn } from "cn";

export function FadeIn({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  viewport = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  viewport?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      {...(viewport
        ? { whileInView: "show", viewport: viewportOnce }
        : { animate: "show" })}
      variants={variants}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  viewport = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  viewport?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      {...(viewport
        ? { whileInView: "show", viewport: viewportOnce }
        : { animate: "show" })}
      variants={staggerContainer(stagger, delay)}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div variants={variants} className={cn(className)}>
      {children}
    </motion.div>
  );
}
