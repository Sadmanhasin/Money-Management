import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { CategorySummary } from "@/lib/data";

export function ExpenseCategoryTable({ categories }: { categories: CategorySummary[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">Expense by Category</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {categories.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No expenses recorded this month.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-[#d03b3b]">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                    {item.percentage}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
