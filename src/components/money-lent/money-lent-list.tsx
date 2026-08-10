"use client";

import { HandCoins } from "lucide-react";
import { deleteMoneyLentAction } from "@/actions/money-lent";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { MoneyLentFormDialog } from "@/components/money-lent/money-lent-form-dialog";
import { ReceivePaymentDialog } from "@/components/money-lent/receive-payment-dialog";

type MoneyLentRecord = {
  id: string;
  personName: string;
  amount: number;
  receivedAmount: number;
  expectedReturnDate: Date;
  reason: string | null;
  status: "PENDING" | "PARTIAL" | "RECEIVED";
};

const STATUS_STYLES: Record<MoneyLentRecord["status"], { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-[#fab219]/15 text-[#a86a00]" },
  PARTIAL: { label: "Partial", className: "bg-[#2a78d6]/10 text-[#2a78d6]" },
  RECEIVED: { label: "Received", className: "bg-[#0ca30c]/10 text-[#0ca30c]" },
};

export function MoneyLentList({ entries }: { entries: MoneyLentRecord[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No money lent entries</p>
        <p className="text-sm text-muted-foreground">Track money you lend to others here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => {
        const remaining = Math.round((entry.amount - entry.receivedAmount) * 100) / 100;
        const isSettled = entry.status === "RECEIVED";
        const statusStyle = STATUS_STYLES[entry.status];

        return (
          <Card key={entry.id} className="shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/10">
                  <HandCoins className="size-4 text-[#d4af37]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.personName}</p>
                  {entry.reason ? (
                    <p className="truncate text-sm text-muted-foreground">{entry.reason}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Due {formatDate(entry.expectedReturnDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-lg font-semibold tabular-nums">
                      {formatCurrency(isSettled ? entry.amount : remaining)}
                    </span>
                    {entry.status === "PARTIAL" ? (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(entry.receivedAmount)} of {formatCurrency(entry.amount)} received
                      </p>
                    ) : null}
                  </div>
                  <Badge className={cn("border-0", statusStyle.className)}>{statusStyle.label}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <MoneyLentFormDialog mode="edit" loan={entry} />
                  {!isSettled ? (
                    <ReceivePaymentDialog id={entry.id} personName={entry.personName} remaining={remaining} />
                  ) : null}
                  <DeleteButton itemLabel="Loan" onDelete={() => deleteMoneyLentAction(entry.id)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
