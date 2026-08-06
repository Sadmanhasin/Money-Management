"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations";

export type ExpenseFormState = { error?: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function parseExpenseForm(formData: FormData) {
  return expenseSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date"),
    note: formData.get("note"),
  });
}

export async function createExpenseAction(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const userId = await requireUserId();
  const parsed = parseExpenseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid expense data" };
  }

  const { amount, category, date, note } = parsed.data;
  await prisma.expense.create({
    data: { amount, category, date: new Date(date), note: note || null, userId },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return undefined;
}

export async function updateExpenseAction(
  id: string,
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const userId = await requireUserId();
  const parsed = parseExpenseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid expense data" };
  }

  const { amount, category, date, note } = parsed.data;
  const result = await prisma.expense.updateMany({
    where: { id, userId },
    data: { amount, category, date: new Date(date), note: note || null },
  });

  if (result.count === 0) {
    return { error: "Expense not found" };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return undefined;
}

export async function deleteExpenseAction(id: string) {
  const userId = await requireUserId();
  await prisma.expense.deleteMany({ where: { id, userId } });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
