import {
  Wallet,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Home,
  HeartPulse,
  Clapperboard,
  GraduationCap,
  Briefcase,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/data";

const EXPENSE_ICONS: Record<string, LucideIcon> = {
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Rent: Home,
  Health: HeartPulse,
  Entertainment: Clapperboard,
  Education: GraduationCap,
  Business: Briefcase,
  Other: Tag,
};

function getTransactionIcon(transaction: Transaction) {
  if (transaction.type === "income") return Wallet;
  return EXPENSE_ICONS[transaction.label] ?? Tag;
}

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="divide-y px-2 pb-2">
            {transactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction);
              return (
                <li
                  key={`${transaction.type}-${transaction.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        transaction.type === "income" ? "bg-[#0ca30c]/10" : "bg-[#d03b3b]/10"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px]",
                          transaction.type === "income" ? "text-[#0ca30c]" : "text-[#d03b3b]"
                        )}
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{transaction.label}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      transaction.type === "income" ? "text-[#0ca30c]" : "text-[#d03b3b]"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
