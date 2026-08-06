import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "positive" | "negative";

const TONE_STYLES: Record<Tone, { text: string; bg: string; icon: string }> = {
  neutral: { text: "text-foreground", bg: "bg-muted", icon: "text-muted-foreground" },
  positive: { text: "text-[#0ca30c]", bg: "bg-[#0ca30c]/10", icon: "text-[#0ca30c]" },
  negative: { text: "text-[#d03b3b]", bg: "bg-[#d03b3b]/10", icon: "text-[#d03b3b]" },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <Card className="shadow-sm transition-shadow duration-150 hover:shadow-md">
      <CardContent className="flex items-center justify-between gap-2 p-4">
        <div className="min-w-0">
          <p className="text-xs leading-tight text-muted-foreground sm:text-sm">{title}</p>
          <p className={cn("mt-1 text-lg font-semibold tabular-nums sm:text-xl", styles.text)}>{value}</p>
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", styles.bg)}>
          <Icon className={cn("size-4", styles.icon)} />
        </div>
      </CardContent>
    </Card>
  );
}
