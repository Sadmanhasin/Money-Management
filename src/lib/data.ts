import "server-only";
import { format, addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { Prisma, type ExpenseCategory } from "@/generated/prisma/client";
import { CATEGORY_LABELS } from "@/lib/validations";
import {
  getTotalIncome,
  getTotalExpense,
  getMonthlyIncome,
  getMonthlyExpense,
  getExpenseByCategory,
  getOutstandingLent,
  getOutstandingBorrowed,
  getActiveInvestments,
  calculateCurrentBalance,
  type OutstandingSummary,
  type CategoryBreakdown,
} from "@/lib/finance";

const toNumber = (value: { toString(): string }) => Number(value.toString());

export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  label: string;
  date: Date;
  note: string | null;
};

export type MonthlyPoint = { month: string; total: number };
export type CategorySummary = CategoryBreakdown;

export type DashboardSummary = {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthIncome: number;
  monthExpense: number;
  recentTransactions: Transaction[];
  monthlyIncome: MonthlyPoint[];
  monthlyExpense: MonthlyPoint[];
  expenseByCategory: CategorySummary[];
  moneyLent: OutstandingSummary;
  moneyBorrowed: OutstandingSummary;
  activeInvestments: OutstandingSummary;
};

async function buildMonthlySeries(
  userId: string,
  type: "income" | "expense",
  monthsForward = 5
): Promise<MonthlyPoint[]> {
  const now = new Date();
  const months = Array.from({ length: monthsForward }, (_, index) => addMonths(now, index));
  const totals = await Promise.all(
    months.map((month) =>
      type === "income" ? getMonthlyIncome(userId, month) : getMonthlyExpense(userId, month)
    )
  );
  return months.map((month, index) => ({ month: format(month, "MMM yyyy"), total: totals[index] }));
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const now = new Date();

  const [
    totalIncome,
    totalExpense,
    monthIncome,
    monthExpense,
    expenseByCategory,
    moneyLent,
    moneyBorrowed,
    activeInvestments,
    recentIncomes,
    recentExpenses,
    monthlyIncome,
    monthlyExpense,
  ] = await Promise.all([
    getTotalIncome(userId),
    getTotalExpense(userId),
    getMonthlyIncome(userId, now),
    getMonthlyExpense(userId, now),
    getExpenseByCategory(userId, now),
    getOutstandingLent(userId),
    getOutstandingBorrowed(userId),
    getActiveInvestments(userId),
    prisma.income.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
    prisma.expense.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
    buildMonthlySeries(userId, "income"),
    buildMonthlySeries(userId, "expense"),
  ]);

  const currentBalance = calculateCurrentBalance({
    totalIncome,
    totalExpense,
    outstandingLent: moneyLent.total,
    outstandingBorrowed: moneyBorrowed.total,
    activeInvestments: activeInvestments.total,
  });

  const recentTransactions: Transaction[] = [
    ...recentIncomes.map((item) => ({
      id: item.id,
      type: "income" as const,
      amount: toNumber(item.amount),
      label: item.source,
      date: item.date,
      note: item.note,
    })),
    ...recentExpenses.map((item) => ({
      id: item.id,
      type: "expense" as const,
      amount: toNumber(item.amount),
      label: CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS],
      date: item.date,
      note: item.note,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  return {
    currentBalance,
    totalIncome,
    totalExpense,
    monthIncome,
    monthExpense,
    recentTransactions,
    monthlyIncome,
    monthlyExpense,
    expenseByCategory,
    moneyLent,
    moneyBorrowed,
    activeInvestments,
  };
}

export type ListFilters = {
  search?: string;
  month?: string;
  year?: string;
};

function dateRangeFilter(filters: ListFilters): Prisma.DateTimeFilter | undefined {
  if (!filters.year) return undefined;
  const year = Number(filters.year);
  if (Number.isNaN(year)) return undefined;

  if (filters.month) {
    const month = Number(filters.month);
    if (Number.isNaN(month) || month < 1 || month > 12) return undefined;
    return {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  return {
    gte: new Date(year, 0, 1),
    lt: new Date(year + 1, 0, 1),
  };
}

export async function getIncomes(userId: string, filters: ListFilters) {
  const dateFilter = dateRangeFilter(filters);
  const where: Prisma.IncomeWhereInput = {
    userId,
    ...(dateFilter ? { date: dateFilter } : {}),
    ...(filters.search
      ? { source: { contains: filters.search, mode: "insensitive" } }
      : {}),
  };

  const incomes = await prisma.income.findMany({ where, orderBy: { date: "desc" } });
  return incomes.map((item) => ({ ...item, amount: toNumber(item.amount) }));
}

export async function getExpenses(userId: string, filters: ListFilters) {
  const dateFilter = dateRangeFilter(filters);
  const searchedCategory = filters.search
    ? (Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).find((key) =>
        CATEGORY_LABELS[key].toLowerCase().includes(filters.search!.toLowerCase())
      )
    : undefined;

  const where: Prisma.ExpenseWhereInput = {
    userId,
    ...(dateFilter ? { date: dateFilter } : {}),
    ...(filters.search
      ? searchedCategory
        ? { category: searchedCategory }
        : { note: { contains: filters.search, mode: "insensitive" } }
      : {}),
  };

  const expenses = await prisma.expense.findMany({ where, orderBy: { date: "desc" } });
  return expenses.map((item) => ({ ...item, amount: toNumber(item.amount) }));
}

export async function getAvailableYears(userId: string): Promise<number[]> {
  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({ where: { userId }, select: { date: true } }),
    prisma.expense.findMany({ where: { userId }, select: { date: true } }),
  ]);

  const years = new Set<number>([new Date().getFullYear()]);
  for (const item of [...incomes, ...expenses]) years.add(item.date.getFullYear());

  return Array.from(years).sort((a, b) => b - a);
}

export async function getMoneyLentEntries(userId: string) {
  const entries = await prisma.moneyLent.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { expectedReturnDate: "asc" }],
  });
  return entries.map((item) => ({
    ...item,
    amount: toNumber(item.amount),
    receivedAmount: toNumber(item.receivedAmount),
  }));
}

export async function getMoneyBorrowedEntries(userId: string) {
  const entries = await prisma.moneyBorrowed.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { expectedReturnDate: "asc" }],
  });
  return entries.map((item) => ({ ...item, amount: toNumber(item.amount) }));
}

export async function getInvestmentEntries(userId: string) {
  const entries = await prisma.investment.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { investmentDate: "desc" }],
  });
  return entries.map((item) => ({ ...item, amount: toNumber(item.amount) }));
}
