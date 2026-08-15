import { TrendingUp, TrendingDown, Wallet, HandCoins, Landmark, PiggyBank } from "lucide-react";
import { auth } from "@/auth";
import { resolveReportPeriod, getReportsData } from "@/lib/reports";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatCard } from "@/components/dashboard/stat-card";
import { PeriodFilter } from "@/components/reports/period-filter";
import { IncomeExpenseChart } from "@/components/reports/income-expense-chart";
import { ExpenseAnalysisTable } from "@/components/reports/expense-analysis-table";
import { LoanReportCard } from "@/components/reports/loan-report-card";
import { InvestmentReportCard } from "@/components/reports/investment-report-card";
import { MonthlyTrendTable } from "@/components/reports/monthly-trend-table";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const period = resolveReportPeriod(params);
  const data = await getReportsData(session!.user.id, period);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Financial Reports</h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(period.from)} &ndash; {formatDate(period.to)}
          </p>
        </div>
        <PeriodFilter from={period.from} to={period.to} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        <StatCard
          title="Total Income"
          value={formatCurrency(data.overview.totalIncome)}
          icon={TrendingUp}
          tone="positive"
        />
        <StatCard
          title="Total Expense"
          value={formatCurrency(data.overview.totalExpense)}
          icon={TrendingDown}
          tone="negative"
        />
        <StatCard
          title="Net Cash Flow"
          value={formatCurrency(data.overview.netCashFlow)}
          icon={Wallet}
          tone={data.overview.netCashFlow >= 0 ? "positive" : "negative"}
        />
        <StatCard
          title="Money Lent"
          value={formatCurrency(data.overview.moneyLent)}
          icon={HandCoins}
          tone="neutral"
        />
        <StatCard
          title="Money Borrowed"
          value={formatCurrency(data.overview.moneyBorrowed)}
          icon={Landmark}
          tone="neutral"
        />
        <StatCard
          title="Active Investments"
          value={formatCurrency(data.overview.activeInvestments)}
          icon={PiggyBank}
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <IncomeExpenseChart data={data.trendSeries} />
        <ExpenseAnalysisTable categories={data.expenseByCategory} />
      </div>

      <LoanReportCard
        title="Money Lent Report"
        icon={HandCoins}
        stats={[
          { label: "Outstanding", value: formatCurrency(data.moneyLentReport.outstandingTotal) },
          { label: "People", value: String(data.moneyLentReport.peopleCount) },
          { label: "Total Received", value: formatCurrency(data.moneyLentReport.totalReceived), tone: "positive" },
          { label: "Overdue", value: formatCurrency(data.moneyLentReport.overdueAmount), tone: "negative" },
        ]}
        entries={data.moneyLentReport.entries}
        emptyLabel="No outstanding money lent."
      />

      <LoanReportCard
        title="Money Borrowed Report"
        icon={Landmark}
        stats={[
          { label: "Outstanding", value: formatCurrency(data.moneyBorrowedReport.outstandingTotal) },
          { label: "People", value: String(data.moneyBorrowedReport.peopleCount) },
          { label: "Total Paid", value: formatCurrency(data.moneyBorrowedReport.totalPaid), tone: "positive" },
          { label: "Overdue", value: formatCurrency(data.moneyBorrowedReport.overdueAmount), tone: "negative" },
        ]}
        entries={data.moneyBorrowedReport.entries}
        emptyLabel="No outstanding money borrowed."
      />

      <InvestmentReportCard
        activeTotal={data.investmentReport.activeTotal}
        activeCount={data.investmentReport.activeCount}
        totalWithdrawn={data.investmentReport.totalWithdrawn}
        entries={data.investmentReport.entries}
      />

      <MonthlyTrendTable points={data.monthlyTrend} />
    </div>
  );
}
