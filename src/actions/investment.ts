"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { investmentSchema } from "@/lib/validations";

export type InvestmentFormState = { error?: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function parseInvestmentForm(formData: FormData) {
  return investmentSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    investmentDate: formData.get("investmentDate"),
  });
}

export async function createInvestmentAction(
  _prevState: InvestmentFormState,
  formData: FormData
): Promise<InvestmentFormState> {
  const userId = await requireUserId();
  const parsed = parseInvestmentForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid investment data" };
  }

  const { name, amount, investmentDate } = parsed.data;
  await prisma.investment.create({
    data: { name, amount, investmentDate: new Date(investmentDate), userId },
  });

  revalidatePath("/investments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return undefined;
}

export async function updateInvestmentAction(
  id: string,
  _prevState: InvestmentFormState,
  formData: FormData
): Promise<InvestmentFormState> {
  const userId = await requireUserId();
  const parsed = parseInvestmentForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid investment data" };
  }

  const { name, amount, investmentDate } = parsed.data;
  const result = await prisma.investment.updateMany({
    where: { id, userId },
    data: { name, amount, investmentDate: new Date(investmentDate) },
  });

  if (result.count === 0) {
    return { error: "Investment not found" };
  }

  revalidatePath("/investments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return undefined;
}

export async function markInvestmentWithdrawnAction(id: string) {
  const userId = await requireUserId();
  await prisma.investment.updateMany({
    where: { id, userId },
    data: { status: "WITHDRAWN" },
  });
  revalidatePath("/investments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function deleteInvestmentAction(id: string) {
  const userId = await requireUserId();
  await prisma.investment.deleteMany({ where: { id, userId } });
  revalidatePath("/investments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}
