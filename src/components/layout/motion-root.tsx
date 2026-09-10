"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Makes every Framer Motion animation in the app respect prefers-reduced-motion. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
