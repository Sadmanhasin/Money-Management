"use client";

import { PiggyBank } from "lucide-react";
import { deleteInvestmentAction } from "@/actions/investment";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { InvestmentFormDialog } from "@/components/investment/investment-form-dialog";
import { MarkWithdrawnButton } from "@/components/investment/mark-withdrawn-button";

type InvestmentRecord = {
  id: string;
  name: string;
  amount: number;
  investmentDate: Date;
  status: "ACTIVE" | "WITHDRAWN";
};

const STATUS_STYLES: Record<InvestmentRecord["status"], { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-[#2a78d6]/10 text-[#2a78d6]" },
  WITHDRAWN: { label: "Withdrawn", className: "bg-muted text-muted-foreground" },
};

export function InvestmentList({ entries }: { entries: InvestmentRecord[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No investments</p>
        <p className="text-sm text-muted-foreground">Track money you move into investments here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => {
        const isActive = entry.status === "ACTIVE";
        const statusStyle = STATUS_STYLES[entry.status];

        return (
          <Card key={entry.id} className="shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2a78d6]/10">
                  <PiggyBank className="size-4 text-[#2a78d6]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Invested {formatDate(entry.investmentDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold tabular-nums">{formatCurrency(entry.amount)}</span>
                  <Badge className={cn("border-0", statusStyle.className)}>{statusStyle.label}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <InvestmentFormDialog mode="edit" investment={entry} />
                  {isActive ? <MarkWithdrawnButton id={entry.id} name={entry.name} /> : null}
                  <DeleteButton itemLabel="Investment" onDelete={() => deleteInvestmentAction(entry.id)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
