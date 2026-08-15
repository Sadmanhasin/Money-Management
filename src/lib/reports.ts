import "server-only";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMonths,
  subMonths,
  eachDayOfInterval,
  differenceInCalendarDays,
  isAfter,
  format,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  getOutstandingLent,
  getOutstandingBorrowed,
  getActiveInvestments,
  type OutstandingSummary,
} from "@/lib/finance";
import { getMoneyLentEntries, getMoneyBorrowedEntries, getInvestmentEntries } from "@/lib/data";
import { CATEGORY_LABELS } from "@/lib/validations";
import type { ExpenseCategory } from "@/generated/prisma/client";

const toNumber = (value: { toString(): string }) => Number(value.toString());
const round2 = (value: number) => Math.round(value * 100) / 100;
const round1 = (value: number) => Math.round(value * 10) / 10;

export type ReportPeriodKey = "this-month" | "last-month" | "last-3-months" | "this-year" | "custom";

export type ReportPeriod = {
  key: ReportPeriodKey;
  label: string;
  from: Date;
  to: Date;
};

export function resolveReportPeriod(searchParams: {
  period?: string;
  from?: string;
  to?: string;
}): ReportPeriod {
  const now = new Date();
  const key = (searchParams.period as ReportPeriodKey) || "this-month";

  switch (key) {
    case "last-month": {
      const target = subMonths(now, 1);
      return { key, label: "Last Month", from: startOfMonth(target), to: endOfMonth(target) };
    }
    case "last-3-months": {
      return {
        key,
        label: "Last 3 Months",
        from: startOfMonth(subMonths(now, 2)),
        to: endOfMonth(now),
      };
    }
    case "this-year": {
      return { key, label: "This Year", from: startOfYear(now), to: endOfYear(now) };
    }
    case "custom": {
      const from = searchParams.from ? new Date(searchParams.from) : startOfMonth(now);
      const to = searchParams.to ? new Date(searchParams.to) : now;
      const [safeFrom, safeTo] = isAfter(from, to) ? [to, from] : [from, to];
      return { key, label: "Custom Range", from: safeFrom, to: safeTo };
    }
    default:
      return { key: "this-month", label: "This Month", from: startOfMonth(now), to: endOfMonth(now) };
  }
}

function monthChunks(from: Date, to: Date) {
  const chunks: { start: Date; end: Date; label: string }[] = [];
  let cursor = startOfMonth(from);
  while (!isAfter(cursor, to)) {
    chunks.push({
      start: cursor < from ? from : cursor,
      end: endOfMonth(cursor) > to ? to : endOfMonth(cursor),
      label: format(cursor, "MMM yyyy"),
    });
    cursor = addMonths(cursor, 1);
  }
  return chunks;
}

export type TrendPoint = { label: string; income: number; expense: number };
export type MonthlyTrendPoint = { month: string; income: number; expense: number; net: number };

export type CategoryBreakdown = {
  category: ExpenseCategory;
  label: string;
  amount: number;
  percentage: number;
};

export type LoanReportEntry = {
  id: string;
  personName: string;
  amount: number;
  expectedReturnDate: Date;
  status: string;
  overdue: boolean;
};

export type InvestmentReportEntry = {
  id: string;
  name: string;
  amount: number;
  investmentDate: Date;
  status: string;
};

export type ReportsData = {
  period: ReportPeriod;
  overview: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    moneyLent: number;
    moneyBorrowed: number;
    activeInvestments: number;
  };
  trendSeries: TrendPoint[];
  monthlyTrend: MonthlyTrendPoint[];
  expenseByCategory: CategoryBreakdown[];
  moneyLentReport: {
    outstandingTotal: number;
    peopleCount: number;
    totalReceived: number;
    overdueAmount: number;
    entries: LoanReportEntry[];
  };
  moneyBorrowedReport: {
    outstandingTotal: number;
    peopleCount: number;
    totalPaid: number;
    overdueAmount: number;
    entries: LoanReportEntry[];
  };
  investmentReport: {
    activeTotal: number;
    activeCount: number;
    totalWithdrawn: number;
    entries: InvestmentReportEntry[];
  };
};

export async function getReportsData(userId: string, period: ReportPeriod): Promise<ReportsData> {
  const { from, to } = period;

  const [
    incomeRows,
    expenseRows,
    lentSummary,
    borrowedSummary,
    investmentSummary,
    lentEntries,
    borrowedEntries,
    investmentEntries,
  ] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: from, lte: to } },
      select: { date: true, amount: true },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: from, lte: to } },
      select: { date: true, amount: true, category: true },
    }),
    getOutstandingLent(userId),
    getOutstandingBorrowed(userId),
    getActiveInvestments(userId),
    getMoneyLentEntries(userId),
    getMoneyBorrowedEntries(userId),
    getInvestmentEntries(userId),
  ]);

  const totalIncome = round2(incomeRows.reduce((sum, row) => sum + toNumber(row.amount), 0));
  const totalExpense = round2(expenseRows.reduce((sum, row) => sum + toNumber(row.amount), 0));

  // --- Income vs Expense trend: daily for short ranges, monthly otherwise ---
  const spanDays = differenceInCalendarDays(to, from) + 1;
  const useDaily = spanDays <= 35;

  const trendMap = new Map<string, TrendPoint>();
  if (useDaily) {
    for (const day of eachDayOfInterval({ start: from, end: to })) {
      trendMap.set(format(day, "yyyy-MM-dd"), { label: format(day, "MMM d"), income: 0, expense: 0 });
    }
    for (const row of incomeRows) {
      const bucket = trendMap.get(format(row.date, "yyyy-MM-dd"));
      if (bucket) bucket.income += toNumber(row.amount);
    }
    for (const row of expenseRows) {
      const bucket = trendMap.get(format(row.date, "yyyy-MM-dd"));
      if (bucket) bucket.expense += toNumber(row.amount);
    }
  } else {
    for (const chunk of monthChunks(from, to)) {
      trendMap.set(format(chunk.start, "yyyy-MM"), { label: chunk.label, income: 0, expense: 0 });
    }
    for (const row of incomeRows) {
      const bucket = trendMap.get(format(row.date, "yyyy-MM"));
      if (bucket) bucket.income += toNumber(row.amount);
    }
    for (const row of expenseRows) {
      const bucket = trendMap.get(format(row.date, "yyyy-MM"));
      if (bucket) bucket.expense += toNumber(row.amount);
    }
  }
  const trendSeries = Array.from(trendMap.values()).map((point) => ({
    label: point.label,
    income: round2(point.income),
    expense: round2(point.expense),
  }));

  // --- Monthly Financial Trend: always month-by-month for the selected period ---
  const monthlyMap = new Map<string, MonthlyTrendPoint>();
  const chunks = monthChunks(from, to);
  for (const chunk of chunks) {
    monthlyMap.set(format(chunk.start, "yyyy-MM"), { month: chunk.label, income: 0, expense: 0, net: 0 });
  }
  for (const row of incomeRows) {
    const bucket = monthlyMap.get(format(row.date, "yyyy-MM"));
    if (bucket) bucket.income += toNumber(row.amount);
  }
  for (const row of expenseRows) {
    const bucket = monthlyMap.get(format(row.date, "yyyy-MM"));
    if (bucket) bucket.expense += toNumber(row.amount);
  }
  const monthlyTrend = Array.from(monthlyMap.values()).map((point) => ({
    month: point.month,
    income: round2(point.income),
    expense: round2(point.expense),
    net: round2(point.income - point.expense),
  }));

  // --- Expense by category (period-filtered) ---
  const categoryTotals = new Map<ExpenseCategory, number>();
  for (const row of expenseRows) {
    categoryTotals.set(row.category, (categoryTotals.get(row.category) ?? 0) + toNumber(row.amount));
  }
  const expenseByCategory: CategoryBreakdown[] = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      label: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
      amount: round2(amount),
      percentage: totalExpense > 0 ? round1((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // --- Money Lent report (current state, not period-bound) ---
  const today = new Date();
  const totalReceived = round2(lentEntries.reduce((sum, entry) => sum + entry.receivedAmount, 0));
  const lentOverdue = round2(
    lentEntries
      .filter((entry) => entry.status !== "RECEIVED" && entry.expectedReturnDate < today)
      .reduce((sum, entry) => sum + (entry.amount - entry.receivedAmount), 0)
  );

  // --- Money Borrowed report ---
  const totalPaid = round2(
    borrowedEntries.filter((entry) => entry.status === "PAID").reduce((sum, entry) => sum + entry.amount, 0)
  );
  const borrowedOverdue = round2(
    borrowedEntries
      .filter((entry) => entry.status === "PENDING" && entry.expectedReturnDate < today)
      .reduce((sum, entry) => sum + entry.amount, 0)
  );

  // --- Investment report ---
  const totalWithdrawn = round2(
    investmentEntries
      .filter((entry) => entry.status === "WITHDRAWN")
      .reduce((sum, entry) => sum + entry.amount, 0)
  );

  return {
    period,
    overview: {
      totalIncome,
      totalExpense,
      netCashFlow: round2(totalIncome - totalExpense),
      moneyLent: lentSummary.total,
      moneyBorrowed: borrowedSummary.total,
      activeInvestments: investmentSummary.total,
    },
    trendSeries,
    monthlyTrend,
    expenseByCategory,
    moneyLentReport: {
      outstandingTotal: lentSummary.total,
      peopleCount: lentSummary.count,
      totalReceived,
      overdueAmount: lentOverdue,
      entries: lentEntries.map((entry) => ({
        id: entry.id,
        personName: entry.personName,
        amount: entry.amount - entry.receivedAmount > 0.004 ? entry.amount - entry.receivedAmount : entry.amount,
        expectedReturnDate: entry.expectedReturnDate,
        status: entry.status,
        overdue: entry.status !== "RECEIVED" && entry.expectedReturnDate < today,
      })),
    },
    moneyBorrowedReport: {
      outstandingTotal: borrowedSummary.total,
      peopleCount: borrowedSummary.count,
      totalPaid,
      overdueAmount: borrowedOverdue,
      entries: borrowedEntries.map((entry) => ({
        id: entry.id,
        personName: entry.personName,
        amount: entry.amount,
        expectedReturnDate: entry.expectedReturnDate,
        status: entry.status,
        overdue: entry.status === "PENDING" && entry.expectedReturnDate < today,
      })),
    },
    investmentReport: {
      activeTotal: investmentSummary.total,
      activeCount: investmentSummary.count,
      totalWithdrawn,
      entries: investmentEntries.map((entry) => ({
        id: entry.id,
        name: entry.name,
        amount: entry.amount,
        investmentDate: entry.investmentDate,
        status: entry.status,
      })),
    },
  };
}

export type { OutstandingSummary };
