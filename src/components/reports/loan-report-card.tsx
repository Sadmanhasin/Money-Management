import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LoanReportEntry } from "@/lib/reports";

type StatItem = { label: string; value: string; tone?: "positive" | "negative" | "neutral" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PARTIAL: "Partial",
  RECEIVED: "Received",
  PAID: "Paid",
};

const SETTLED_STATUSES = new Set(["RECEIVED", "PAID"]);

const TONE_CLASS: Record<NonNullable<StatItem["tone"]>, string> = {
  positive: "text-[#0ca30c]",
  negative: "text-[#d03b3b]",
  neutral: "text-foreground",
};

export function LoanReportCard({
  title,
  icon: Icon,
  stats,
  entries,
  emptyLabel,
}: {
  title: string;
  icon: LucideIcon;
  stats: StatItem[];
  entries: LoanReportEntry[];
  emptyLabel: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2a78d6]/10">
          <Icon className="size-4 text-[#2a78d6]" />
        </span>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={cn("mt-1 text-sm font-semibold tabular-nums", TONE_CLASS[stat.tone ?? "neutral"])}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className={cn(entry.overdue && "bg-[#d03b3b]/5")}>
                    <TableCell className="font-medium">{entry.personName}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(entry.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(entry.expectedReturnDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          className={cn(
                            "border-0",
                            SETTLED_STATUSES.has(entry.status)
                              ? "bg-[#0ca30c]/10 text-[#0ca30c]"
                              : "bg-[#fab219]/15 text-[#a86a00]"
                          )}
                        >
                          {STATUS_LABELS[entry.status] ?? entry.status}
                        </Badge>
                        {entry.overdue ? (
                          <Badge className="border-0 bg-[#d03b3b]/10 text-[#d03b3b]">Overdue</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
