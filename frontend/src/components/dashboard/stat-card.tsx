import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/visual/animated-number";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card className="group gap-0 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/25 hover:shadow-md">
      <CardContent className="flex items-start justify-between px-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-serif text-3xl font-semibold tabular-nums tracking-tight">
            <AnimatedNumber value={value} />
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-signal/10 text-signal transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Icon className="size-[18px]" />
        </div>
      </CardContent>
    </Card>
  );
}
