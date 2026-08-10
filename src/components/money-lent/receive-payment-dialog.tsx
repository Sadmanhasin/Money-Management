"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Banknote } from "lucide-react";
import { recordPaymentAction, type MoneyLentFormState } from "@/actions/money-lent";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ReceivePaymentDialog({
  id,
  personName,
  remaining,
}: {
  id: string;
  personName: string;
  remaining: number;
}) {
  const [open, setOpen] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const action = recordPaymentAction.bind(null, id);
  const [state, formAction, isPending] = useActionState<MoneyLentFormState, FormData>(
    action,
    undefined
  );

  useEffect(() => {
    if (submitCount === 0 || isPending) return;
    if (state?.error) {
      toast.error(state.error);
    } else {
      toast.success("Payment recorded");
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Receive payment">
          <Banknote className="size-4 text-[#0ca30c]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive Payment</DialogTitle>
          <DialogDescription>
            {personName} owes {formatCurrency(remaining)}. Record the amount received &mdash; leave it as
            the full balance if they paid everything back at once.
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitCount((count) => count + 1)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount Received</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              defaultValue={remaining}
              required
            />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
