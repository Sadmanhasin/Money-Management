import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { CATEGORY_LABELS } from "@/lib/validations";
import type { ExpenseCategory } from "@/generated/prisma/client";

/**
 * Centralized financial calculation service.
 *
 * Every dashboard and analytics surface should read totals through these
 * functions rather than re-deriving them, so there is exactly one place
 * that defines what counts as income, expense, or an outstanding balance.
 */

const toNumber = (value: { toString(): string }) => Number(value.toString());
const round2 = (value: number) => Math.round(value * 100) / 100;
const round1 = (value: number) => Math.round(value * 10) / 10;

export type OutstandingSummary = { total: number; count: number };
export type CategoryBreakdown = {
  category: ExpenseCategory;
  label: string;
  amount: number;
  percentage: number;
};

export async function getTotalIncome(userId: string): Promise<number> {
  const result = await prisma.income.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return round2(toNumber(result._sum.amount ?? 0));
}

export async function getTotalExpense(userId: string): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return round2(toNumber(result._sum.amount ?? 0));
}

export async function getOutstandingLent(userId: string): Promise<OutstandingSummary> {
  const loans = await prisma.moneyLent.findMany({
    where: { userId, status: { not: "RECEIVED" } },
    select: { amount: true, receivedAmount: true },
  });

  let total = 0;
  let count = 0;
  for (const loan of loans) {
    const outstanding = toNumber(loan.amount) - toNumber(loan.receivedAmount);
    if (outstanding > 0.004) {
      total += outstanding;
      count += 1;
    }
  }
  return { total: round2(total), count };
}

export async function getOutstandingBorrowed(userId: string): Promise<OutstandingSummary> {
  const result = await prisma.moneyBorrowed.aggregate({
    where: { userId, status: "PENDING" },
    _sum: { amount: true },
    _count: true,
  });
  return { total: round2(toNumber(result._sum.amount ?? 0)), count: result._count };
}

export async function getActiveInvestments(userId: string): Promise<OutstandingSummary> {
  const result = await prisma.investment.aggregate({
    where: { userId, status: "ACTIVE" },
    _sum: { amount: true },
    _count: true,
  });
  return { total: round2(toNumber(result._sum.amount ?? 0)), count: result._count };
}

/**
 * The single source of truth for the current balance formula:
 * Total Income - Total Expense - Outstanding Lent + Outstanding Borrowed - Active Investments.
 * Pure function (no I/O) so both getCurrentBalance() and callers that already
 * fetched the parts (e.g. the dashboard) can share the exact same math.
 */
export function calculateCurrentBalance(parts: {
  totalIncome: number;
  totalExpense: number;
  outstandingLent: number;
  outstandingBorrowed: number;
  activeInvestments: number;
}): number {
  return round2(
    parts.totalIncome -
      parts.totalExpense -
      parts.outstandingLent +
      parts.outstandingBorrowed -
      parts.activeInvestments
  );
}

export async function getCurrentBalance(userId: string): Promise<number> {
  const [totalIncome, totalExpense, lent, borrowed, investments] = await Promise.all([
    getTotalIncome(userId),
    getTotalExpense(userId),
    getOutstandingLent(userId),
    getOutstandingBorrowed(userId),
    getActiveInvestments(userId),
  ]);

  return calculateCurrentBalance({
    totalIncome,
    totalExpense,
    outstandingLent: lent.total,
    outstandingBorrowed: borrowed.total,
    activeInvestments: investments.total,
  });
}

export async function getIncomeForRange(userId: string, from: Date, to: Date): Promise<number> {
  const result = await prisma.income.aggregate({
    where: { userId, date: { gte: from, lte: to } },
    _sum: { amount: true },
  });
  return round2(toNumber(result._sum.amount ?? 0));
}

export async function getExpenseForRange(userId: string, from: Date, to: Date): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: { userId, date: { gte: from, lte: to } },
    _sum: { amount: true },
  });
  return round2(toNumber(result._sum.amount ?? 0));
}

export async function getMonthlyIncome(userId: string, month: Date): Promise<number> {
  return getIncomeForRange(userId, startOfMonth(month), endOfMonth(month));
}

export async function getMonthlyExpense(userId: string, month: Date): Promise<number> {
  return getExpenseForRange(userId, startOfMonth(month), endOfMonth(month));
}

export async function getExpenseByCategoryForRange(
  userId: string,
  from: Date,
  to: Date
): Promise<CategoryBreakdown[]> {
  const grouped = await prisma.expense.groupBy({
    by: ["category"],
    where: { userId, date: { gte: from, lte: to } },
    _sum: { amount: true },
  });

  const total = grouped.reduce((sum, group) => sum + toNumber(group._sum.amount ?? 0), 0);

  return grouped
    .map((group) => {
      const amount = toNumber(group._sum.amount ?? 0);
      return {
        category: group.category,
        label: CATEGORY_LABELS[group.category as keyof typeof CATEGORY_LABELS],
        amount: round2(amount),
        percentage: total > 0 ? round1((amount / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export async function getExpenseByCategory(userId: string, month: Date): Promise<CategoryBreakdown[]> {
  return getExpenseByCategoryForRange(userId, startOfMonth(month), endOfMonth(month));
}
