import { PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InvestmentReportEntry } from "@/lib/reports";

export function InvestmentReportCard({
  activeTotal,
  activeCount,
  totalWithdrawn,
  entries,
}: {
  activeTotal: number;
  activeCount: number;
  totalWithdrawn: number;
  entries: InvestmentReportEntry[];
}) {
  const stats = [
    { label: "Total Active Investment", value: formatCurrency(activeTotal) },
    { label: "Active Investments", value: String(activeCount) },
    { label: "Total Withdrawn", value: formatCurrency(totalWithdrawn) },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2a78d6]/10">
          <PiggyBank className="size-4 text-[#2a78d6]" />
        </span>
        <CardTitle className="text-base font-medium">Investments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active investments.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Investment Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(entry.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(entry.investmentDate)}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "border-0",
                          entry.status === "ACTIVE"
                            ? "bg-[#2a78d6]/10 text-[#2a78d6]"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {entry.status === "ACTIVE" ? "Active" : "Withdrawn"}
                      </Badge>
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
