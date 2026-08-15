"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { moneyBorrowedSchema } from "@/lib/validations";

export type MoneyBorrowedFormState = { error?: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function parseMoneyBorrowedForm(formData: FormData) {
  return moneyBorrowedSchema.safeParse({
    personName: formData.get("personName"),
    amount: formData.get("amount"),
    borrowedDate: formData.get("borrowedDate"),
    expectedReturnDate: formData.get("expectedReturnDate"),
    reason: formData.get("reason"),
  });
}

export async function createMoneyBorrowedAction(
  _prevState: MoneyBorrowedFormState,
  formData: FormData
): Promise<MoneyBorrowedFormState> {
  const userId = await requireUserId();
  const parsed = parseMoneyBorrowedForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid borrowed money data" };
  }

  const { personName, amount, borrowedDate, expectedReturnDate, reason } = parsed.data;
  await prisma.moneyBorrowed.create({
    data: {
      personName,
      amount,
      borrowedDate: new Date(borrowedDate),
      expectedReturnDate: new Date(expectedReturnDate),
      reason: reason || null,
      userId,
    },
  });

  revalidatePath("/money-borrowed");
  revalidatePath("/dashboard");
  return undefined;
}

export async function updateMoneyBorrowedAction(
  id: string,
  _prevState: MoneyBorrowedFormState,
  formData: FormData
): Promise<MoneyBorrowedFormState> {
  const userId = await requireUserId();
  const parsed = parseMoneyBorrowedForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid borrowed money data" };
  }

  const { personName, amount, borrowedDate, expectedReturnDate, reason } = parsed.data;
  const result = await prisma.moneyBorrowed.updateMany({
    where: { id, userId },
    data: {
      personName,
      amount,
      borrowedDate: new Date(borrowedDate),
      expectedReturnDate: new Date(expectedReturnDate),
      reason: reason || null,
    },
  });

  if (result.count === 0) {
    return { error: "Borrowed money entry not found" };
  }

  revalidatePath("/money-borrowed");
  revalidatePath("/dashboard");
  return undefined;
}

export async function markMoneyBorrowedPaidAction(id: string) {
  const userId = await requireUserId();
  await prisma.moneyBorrowed.updateMany({
    where: { id, userId },
    data: { status: "PAID" },
  });
  revalidatePath("/money-borrowed");
  revalidatePath("/dashboard");
}

export async function deleteMoneyBorrowedAction(id: string) {
  const userId = await requireUserId();
  await prisma.moneyBorrowed.deleteMany({ where: { id, userId } });
  revalidatePath("/money-borrowed");
  revalidatePath("/dashboard");
}
