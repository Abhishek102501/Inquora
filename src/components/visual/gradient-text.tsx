import type { ElementType, ReactNode } from "react";
import { cn } from "cn";

export function GradientText({
  children,
  as: Tag = "span",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return <Tag className={cn("text-gradient-intel", className)}>{children}</Tag>;
}
