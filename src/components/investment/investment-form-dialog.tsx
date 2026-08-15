"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { PiggyBank, Pencil } from "lucide-react";
import {
  createInvestmentAction,
  updateInvestmentAction,
  type InvestmentFormState,
} from "@/actions/investment";
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

type InvestmentRecord = {
  id: string;
  name: string;
  amount: number;
  investmentDate: Date;
};

type Props =
  | { mode: "create"; investment?: undefined }
  | { mode: "edit"; investment: InvestmentRecord };

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function InvestmentFormDialog({ mode, investment }: Props) {
  const [open, setOpen] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const action =
    mode === "edit" ? updateInvestmentAction.bind(null, investment.id) : createInvestmentAction;
  const [state, formAction, isPending] = useActionState<InvestmentFormState, FormData>(
    action,
    undefined
  );

  useEffect(() => {
    if (submitCount === 0 || isPending) return;
    if (state?.error) {
      toast.error(state.error);
    } else {
      toast.success(mode === "edit" ? "Investment updated" : "Investment added");
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="ghost" size="icon-sm" aria-label="Edit investment">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <PiggyBank className="size-4" />
            <span>Investment</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Investment" : "Add Investment"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update this investment entry." : "Track money you've moved into an investment."}
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitCount((count) => count + 1)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Investment Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Stocks, Mutual Fund, Fixed Deposit"
              defaultValue={investment?.name}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              defaultValue={investment?.amount}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="investmentDate">Investment Date</Label>
            <Input
              id="investmentDate"
              name="investmentDate"
              type="date"
              defaultValue={
                investment ? toDateInputValue(investment.investmentDate) : toDateInputValue(new Date())
              }
              required
            />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : mode === "edit" ? "Save changes" : "Add Investment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
