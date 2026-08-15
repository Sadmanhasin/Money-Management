"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Landmark, Pencil } from "lucide-react";
import {
  createMoneyBorrowedAction,
  updateMoneyBorrowedAction,
  type MoneyBorrowedFormState,
} from "@/actions/money-borrowed";
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

type MoneyBorrowedRecord = {
  id: string;
  personName: string;
  amount: number;
  borrowedDate: Date;
  expectedReturnDate: Date;
  reason: string | null;
};

type Props =
  | { mode: "create"; loan?: undefined }
  | { mode: "edit"; loan: MoneyBorrowedRecord };

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function MoneyBorrowedFormDialog({ mode, loan }: Props) {
  const [open, setOpen] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const action =
    mode === "edit" ? updateMoneyBorrowedAction.bind(null, loan.id) : createMoneyBorrowedAction;
  const [state, formAction, isPending] = useActionState<MoneyBorrowedFormState, FormData>(
    action,
    undefined
  );

  useEffect(() => {
    if (submitCount === 0 || isPending) return;
    if (state?.error) {
      toast.error(state.error);
    } else {
      toast.success(mode === "edit" ? "Borrowed money updated" : "Borrowed money added");
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="ghost" size="icon-sm" aria-label="Edit borrowed money">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Landmark className="size-4" />
            <span>Money Borrowed</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Borrowed Money" : "Money Borrowed"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update this borrowed money entry." : "Track money you've borrowed from someone."}
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitCount((count) => count + 1)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="personName">Person Name</Label>
            <Input
              id="personName"
              name="personName"
              placeholder="e.g. John Doe"
              defaultValue={loan?.personName}
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
              defaultValue={loan?.amount}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="borrowedDate">Borrowed Date</Label>
            <Input
              id="borrowedDate"
              name="borrowedDate"
              type="date"
              defaultValue={loan ? toDateInputValue(loan.borrowedDate) : toDateInputValue(new Date())}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
            <Input
              id="expectedReturnDate"
              name="expectedReturnDate"
              type="date"
              defaultValue={loan ? toDateInputValue(loan.expectedReturnDate) : toDateInputValue(new Date())}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input id="reason" name="reason" placeholder="Optional reason" defaultValue={loan?.reason ?? ""} />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : mode === "edit" ? "Save changes" : "Add Borrowed Money"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
