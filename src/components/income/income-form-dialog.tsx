"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import {
  createIncomeAction,
  updateIncomeAction,
  type IncomeFormState,
} from "@/actions/income";
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

type IncomeRecord = {
  id: string;
  amount: number;
  source: string;
  date: Date;
  note: string | null;
};

type Props =
  | { mode: "create"; income?: undefined }
  | { mode: "edit"; income: IncomeRecord };

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function IncomeFormDialog({ mode, income }: Props) {
  const [open, setOpen] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const action = mode === "edit" ? updateIncomeAction.bind(null, income.id) : createIncomeAction;
  const [state, formAction, isPending] = useActionState<IncomeFormState, FormData>(
    action,
    undefined
  );

  useEffect(() => {
    if (submitCount === 0 || isPending) return;
    if (state?.error) {
      toast.error(state.error);
    } else {
      toast.success(mode === "edit" ? "Income updated" : "Income added");
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="ghost" size="icon-sm" aria-label="Edit income">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add Income</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Income" : "Add Income"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update this income entry." : "Record a new income entry."}
          </DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          onSubmit={() => setSubmitCount((count) => count + 1)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              defaultValue={income?.amount}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              name="source"
              placeholder="e.g. Salary, Freelance"
              defaultValue={income?.source}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={income ? toDateInputValue(income.date) : toDateInputValue(new Date())}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" placeholder="Optional note" defaultValue={income?.note ?? ""} />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
