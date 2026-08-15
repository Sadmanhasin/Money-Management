import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MonthlyTrendPoint } from "@/lib/reports";

export function MonthlyTrendTable({ points }: { points: MonthlyTrendPoint[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">Monthly Financial Trend</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {points.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No data available for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Income</TableHead>
                  <TableHead className="text-right">Expense</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point) => (
                  <TableRow key={point.month}>
                    <TableCell className="font-medium">{point.month}</TableCell>
                    <TableCell className="text-right tabular-nums text-[#0ca30c]">
                      {formatCurrency(point.income)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[#d03b3b]">
                      {formatCurrency(point.expense)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold tabular-nums",
                        point.net >= 0 ? "text-[#0ca30c]" : "text-[#d03b3b]"
                      )}
                    >
                      {formatCurrency(point.net)}
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
