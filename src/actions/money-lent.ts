"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { moneyLentSchema, paymentSchema } from "@/lib/validations";
import type { LoanStatus } from "@/generated/prisma/client";

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

function statusForAmounts(amount: number, receivedAmount: number): LoanStatus {
  if (receivedAmount >= amount) return "RECEIVED";
  if (receivedAmount > 0) return "PARTIAL";
  return "PENDING";
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

  const existing = await prisma.moneyLent.findFirst({ where: { id, userId } });
  if (!existing) {
    return { error: "Loan entry not found" };
  }

  const { personName, amount, expectedReturnDate, reason } = parsed.data;
  const currentReceived = Number(existing.receivedAmount.toString());
  const receivedAmount = Math.min(currentReceived, amount);

  await prisma.moneyLent.update({
    where: { id },
    data: {
      personName,
      amount,
      expectedReturnDate: new Date(expectedReturnDate),
      reason: reason || null,
      receivedAmount,
      status: statusForAmounts(amount, receivedAmount),
    },
  });

  revalidatePath("/money-lent");
  revalidatePath("/dashboard");
  return undefined;
}

export async function recordPaymentAction(
  id: string,
  _prevState: MoneyLentFormState,
  formData: FormData
): Promise<MoneyLentFormState> {
  const userId = await requireUserId();
  const parsed = paymentSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payment amount" };
  }

  const existing = await prisma.moneyLent.findFirst({ where: { id, userId } });
  if (!existing) {
    return { error: "Loan entry not found" };
  }

  const amount = Number(existing.amount.toString());
  const currentReceived = Number(existing.receivedAmount.toString());
  const remaining = Math.round((amount - currentReceived) * 100) / 100;

  if (parsed.data.amount > remaining + 0.004) {
    return { error: `Payment cannot exceed the remaining balance of ${remaining}` };
  }

  const receivedAmount = Math.min(amount, currentReceived + parsed.data.amount);

  await prisma.moneyLent.update({
    where: { id },
    data: {
      receivedAmount,
      status: statusForAmounts(amount, receivedAmount),
    },
  });

  revalidatePath("/money-lent");
  revalidatePath("/dashboard");
  return undefined;
}

export async function deleteMoneyLentAction(id: string) {
  const userId = await requireUserId();
  await prisma.moneyLent.deleteMany({ where: { id, userId } });
  revalidatePath("/money-lent");
  revalidatePath("/dashboard");
}
