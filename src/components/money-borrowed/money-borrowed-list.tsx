"use client";

import { Landmark } from "lucide-react";
import { deleteMoneyBorrowedAction } from "@/actions/money-borrowed";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { MoneyBorrowedFormDialog } from "@/components/money-borrowed/money-borrowed-form-dialog";
import { MarkPaidButton } from "@/components/money-borrowed/mark-paid-button";

type MoneyBorrowedRecord = {
  id: string;
  personName: string;
  amount: number;
  borrowedDate: Date;
  expectedReturnDate: Date;
  reason: string | null;
  status: "PENDING" | "PAID";
};

const STATUS_STYLES: Record<MoneyBorrowedRecord["status"], { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-[#fab219]/15 text-[#a86a00]" },
  PAID: { label: "Paid", className: "bg-[#0ca30c]/10 text-[#0ca30c]" },
};

export function MoneyBorrowedList({ entries }: { entries: MoneyBorrowedRecord[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No money borrowed entries</p>
        <p className="text-sm text-muted-foreground">Track money you borrow from others here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => {
        const isPending = entry.status === "PENDING";
        const statusStyle = STATUS_STYLES[entry.status];

        return (
          <Card key={entry.id} className="shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2a78d6]/10">
                  <Landmark className="size-4 text-[#2a78d6]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.personName}</p>
                  {entry.reason ? (
                    <p className="truncate text-sm text-muted-foreground">{entry.reason}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Borrowed {formatDate(entry.borrowedDate)} &middot; Due{" "}
                    {formatDate(entry.expectedReturnDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold tabular-nums">{formatCurrency(entry.amount)}</span>
                  <Badge className={cn("border-0", statusStyle.className)}>{statusStyle.label}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <MoneyBorrowedFormDialog mode="edit" loan={entry} />
                  {isPending ? <MarkPaidButton id={entry.id} personName={entry.personName} /> : null}
                  <DeleteButton itemLabel="Borrowed money" onDelete={() => deleteMoneyBorrowedAction(entry.id)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
