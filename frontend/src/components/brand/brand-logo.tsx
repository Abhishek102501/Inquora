import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "cn";

const markSizes = {
  sm: "size-6",
  md: "size-7",
  lg: "size-9",
} as const;

const iconSizes = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-[18px]",
} as const;

const wordmarkSizes = {
  sm: "text-base",
  md: "text-[17px]",
  lg: "text-xl",
} as const;

interface BrandLogoProps {
  size?: keyof typeof markSizes;
  href?: string | null;
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

/** The INQORA brand mark. Custom identity — intentionally not a Lucide/simple-icons icon. */
export function BrandLogo({
  size = "md",
  href = "/",
  showWordmark = true,
  className,
  onClick,
}: BrandLogoProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-intel to-signal text-white shadow-sm transition-transform duration-300 group-hover:scale-105",
          markSizes[size],
        )}
      >
        <Sparkles className={iconSizes[size]} />
      </span>
      {showWordmark && (
        <span className={cn("font-serif font-semibold tracking-tight text-foreground", wordmarkSizes[size])}>
          Inqora
        </span>
      )}
    </>
  );

  const rootClassName = cn("group flex items-center gap-2.5", className);

  if (href === null) {
    return <span className={rootClassName}>{content}</span>;
  }

  return (
    <Link href={href} className={rootClassName} aria-label="Inqora home" onClick={onClick}>
      {content}
    </Link>
  );
}
