"use client";

import { deleteIncomeAction } from "@/actions/income";
import { formatCurrency, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/shared/delete-button";
import { IncomeFormDialog } from "@/components/income/income-form-dialog";

type IncomeRecord = {
  id: string;
  amount: number;
  source: string;
  date: Date;
  note: string | null;
};

export function IncomeTable({ incomes }: { incomes: IncomeRecord[] }) {
  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No income entries</p>
        <p className="text-sm text-muted-foreground">Add your first income to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomes.map((income) => (
            <TableRow key={income.id}>
              <TableCell className="font-medium">{income.source}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(income.date)}</TableCell>
              <TableCell className="max-w-48 truncate text-muted-foreground">{income.note || "—"}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-[#0ca30c]">
                {formatCurrency(income.amount)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <IncomeFormDialog mode="edit" income={income} />
                  <DeleteButton itemLabel="Income" onDelete={() => deleteIncomeAction(income.id)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
