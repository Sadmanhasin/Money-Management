"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Minus, Pencil } from "lucide-react";
import {
  createExpenseAction,
  updateExpenseAction,
  type ExpenseFormState,
} from "@/actions/expense";
import { EXPENSE_CATEGORIES, CATEGORY_LABELS } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ExpenseRecord = {
  id: string;
  amount: number;
  category: string;
  date: Date;
  note: string | null;
};

type Props =
  | { mode: "create"; expense?: undefined }
  | { mode: "edit"; expense: ExpenseRecord };

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ExpenseFormDialog({ mode, expense }: Props) {
  const [open, setOpen] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const action = mode === "edit" ? updateExpenseAction.bind(null, expense.id) : createExpenseAction;
  const [state, formAction, isPending] = useActionState<ExpenseFormState, FormData>(
    action,
    undefined
  );

  useEffect(() => {
    if (submitCount === 0 || isPending) return;
    if (state?.error) {
      toast.error(state.error);
    } else {
      toast.success(mode === "edit" ? "Expense updated" : "Expense added");
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="ghost" size="icon-sm" aria-label="Edit expense">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Minus className="size-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update this expense entry." : "Record a new expense entry."}
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
              defaultValue={expense?.amount}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue={expense?.category ?? "FOOD"}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={expense ? toDateInputValue(expense.date) : toDateInputValue(new Date())}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" placeholder="Optional note" defaultValue={expense?.note ?? ""} />
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
