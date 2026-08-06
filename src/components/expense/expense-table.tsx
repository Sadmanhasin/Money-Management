"use client";

import { deleteExpenseAction } from "@/actions/expense";
import { formatCurrency, formatDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/validations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { ExpenseFormDialog } from "@/components/expense/expense-form-dialog";

type ExpenseRecord = {
  id: string;
  amount: number;
  category: string;
  date: Date;
  note: string | null;
};

export function ExpenseTable({ expenses }: { expenses: ExpenseRecord[] }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No expense entries</p>
        <p className="text-sm text-muted-foreground">Add your first expense to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                <Badge variant="secondary">
                  {CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(expense.date)}</TableCell>
              <TableCell className="max-w-48 truncate text-muted-foreground">{expense.note || "—"}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-[#d03b3b]">
                {formatCurrency(expense.amount)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <ExpenseFormDialog mode="edit" expense={expense} />
                  <DeleteButton itemLabel="Expense" onDelete={() => deleteExpenseAction(expense.id)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
