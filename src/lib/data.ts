import "server-only";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { Prisma, type ExpenseCategory } from "@/generated/prisma/client";
import { CATEGORY_LABELS } from "@/lib/validations";

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

export type DashboardSummary = {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthIncome: number;
  monthExpense: number;
  recentTransactions: Transaction[];
  monthlyIncome: MonthlyPoint[];
  monthlyExpense: MonthlyPoint[];
};

function buildMonthlySeries(
  items: { date: Date; amount: { toString(): string } }[],
  monthsBack = 5
): MonthlyPoint[] {
  const now = new Date();
  const buckets = Array.from({ length: monthsBack }, (_, index) => {
    const d = subMonths(now, monthsBack - 1 - index);
    return { key: format(d, "yyyy-MM"), month: format(d, "MMM yyyy"), total: 0 };
  });
  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const item of items) {
    const key = format(item.date, "yyyy-MM");
    const bucket = bucketMap.get(key);
    if (bucket) bucket.total += toNumber(item.amount);
  }

  return buckets.map(({ month, total }) => ({ month, total: Math.round(total * 100) / 100 }));
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.expense.findMany({ where: { userId }, orderBy: { date: "desc" } }),
  ]);

  const totalIncome = incomes.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + toNumber(item.amount), 0);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthIncome = incomes
    .filter((item) => item.date >= monthStart && item.date <= monthEnd)
    .reduce((sum, item) => sum + toNumber(item.amount), 0);

  const monthExpense = expenses
    .filter((item) => item.date >= monthStart && item.date <= monthEnd)
    .reduce((sum, item) => sum + toNumber(item.amount), 0);

  const recentTransactions: Transaction[] = [
    ...incomes.map((item) => ({
      id: item.id,
      type: "income" as const,
      amount: toNumber(item.amount),
      label: item.source,
      date: item.date,
      note: item.note,
    })),
    ...expenses.map((item) => ({
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
    currentBalance: Math.round((totalIncome - totalExpense) * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    monthIncome: Math.round(monthIncome * 100) / 100,
    monthExpense: Math.round(monthExpense * 100) / 100,
    recentTransactions,
    monthlyIncome: buildMonthlySeries(incomes),
    monthlyExpense: buildMonthlySeries(expenses),
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
