"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
