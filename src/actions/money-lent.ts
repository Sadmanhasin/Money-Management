"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { moneyLentSchema } from "@/lib/validations";

export type MoneyLentFormState = { error?: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function parseMoneyLentForm(formData: FormData) {
  return moneyLentSchema.safeParse({
    personName: formData.get("personName"),
    amount: formData.get("amount"),
    expectedReturnDate: formData.get("expectedReturnDate"),
    reason: formData.get("reason"),
  });
}

export async function createMoneyLentAction(
  _prevState: MoneyLentFormState,
  formData: FormData
): Promise<MoneyLentFormState> {
  const userId = await requireUserId();
  const parsed = parseMoneyLentForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid loan data" };
  }

  const { personName, amount, expectedReturnDate, reason } = parsed.data;
  await prisma.moneyLent.create({
    data: {
      personName,
      amount,
      expectedReturnDate: new Date(expectedReturnDate),
      reason: reason || null,
      userId,
    },
  });

  revalidatePath("/money-lent");
  revalidatePath("/dashboard");
  return undefined;
}

export async function updateMoneyLentAction(
  id: string,
  _prevState: MoneyLentFormState,
  formData: FormData
): Promise<MoneyLentFormState> {
  const userId = await requireUserId();
  const parsed = parseMoneyLentForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid loan data" };
  }

  const { personName, amount, expectedReturnDate, reason } = parsed.data;
  const result = await prisma.moneyLent.updateMany({
    where: { id, userId },
    data: {
      personName,
      amount,
      expectedReturnDate: new Date(expectedReturnDate),
      reason: reason || null,
    },
  });

  if (result.count === 0) {
    return { error: "Loan entry not found" };
  }

  revalidatePath("/money-lent");
  revalidatePath("/dashboard");
  return undefined;
}

export async function markMoneyLentReceivedAction(id: string) {
  const userId = await requireUserId();
  await prisma.moneyLent.updateMany({
    where: { id, userId },
    data: { status: "RECEIVED" },
  });
  revalidatePath("/money-lent");
  revalidatePath("/dashboard");
}

export async function deleteMoneyLentAction(id: string) {
  const userId = await requireUserId();
  await prisma.moneyLent.deleteMany({ where: { id, userId } });
  revalidatePath("/money-lent");
  revalidatePath("/dashboard");
}
