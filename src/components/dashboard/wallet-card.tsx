import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { UserAvatar } from "@/components/shared/user-avatar";

export function WalletCard({
  name,
  email,
  balance,
}: {
  name?: string | null;
  email?: string | null;
  balance: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#111827] p-6 text-white shadow-lg sm:p-8">
      <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar name={name} email={email} className="ring-2 ring-white/15" />
          <span className="font-medium text-[#d4af37]">{name || "Your Wallet"}</span>
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-white/10">
          <Wallet className="size-4" />
        </div>
      </div>
      <div className="relative mt-8 sm:mt-10">
        <p className="text-sm text-white/60">Your Current Balance</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums sm:text-4xl">{formatCurrency(balance)}</p>
      </div>
    </div>
  );
}
