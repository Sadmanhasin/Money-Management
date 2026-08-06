"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { incomeSchema } from "@/lib/validations";

export type IncomeFormState = { error?: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function parseIncomeForm(formData: FormData) {
  return incomeSchema.safeParse({
    amount: formData.get("amount"),
    source: formData.get("source"),
    date: formData.get("date"),
    note: formData.get("note"),
  });
}

export async function createIncomeAction(
  _prevState: IncomeFormState,
  formData: FormData
): Promise<IncomeFormState> {
  const userId = await requireUserId();
  const parsed = parseIncomeForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid income data" };
  }

  const { amount, source, date, note } = parsed.data;
  await prisma.income.create({
    data: { amount, source, date: new Date(date), note: note || null, userId },
  });

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return undefined;
}

export async function updateIncomeAction(
  id: string,
  _prevState: IncomeFormState,
  formData: FormData
): Promise<IncomeFormState> {
  const userId = await requireUserId();
  const parsed = parseIncomeForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid income data" };
  }

  const { amount, source, date, note } = parsed.data;
  const result = await prisma.income.updateMany({
    where: { id, userId },
    data: { amount, source, date: new Date(date), note: note || null },
  });

  if (result.count === 0) {
    return { error: "Income not found" };
  }

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return undefined;
}

export async function deleteIncomeAction(id: string) {
  const userId = await requireUserId();
  await prisma.income.deleteMany({ where: { id, userId } });
  revalidatePath("/income");
  revalidatePath("/dashboard");
}
