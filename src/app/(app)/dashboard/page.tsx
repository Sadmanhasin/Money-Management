import { TrendingUp, TrendingDown, CalendarDays, CalendarClock, HandCoins } from "lucide-react";
import { auth } from "@/auth";
import { getDashboardSummary } from "@/lib/data";
import { getCurrentUser } from "@/lib/current-user";
import { formatCurrency } from "@/lib/format";
import { StatCard } from "@/components/dashboard/stat-card";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { ExpenseCategoryTable } from "@/components/dashboard/expense-category-table";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default async function DashboardPage() {
  const session = await auth();
  const [summary, currentUser] = await Promise.all([
    getDashboardSummary(session!.user.id),
    getCurrentUser(session!.user.id),
  ]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <WalletCard name={currentUser?.name} email={currentUser?.email} balance={summary.currentBalance} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard title="Total Income" value={formatCurrency(summary.totalIncome)} icon={TrendingUp} tone="positive" />
        <StatCard title="Total Expense" value={formatCurrency(summary.totalExpense)} icon={TrendingDown} tone="negative" />
        <StatCard title="Income This Month" value={formatCurrency(summary.monthIncome)} icon={CalendarDays} tone="positive" />
        <StatCard title="Expense This Month" value={formatCurrency(summary.monthExpense)} icon={CalendarClock} tone="negative" />
        <StatCard
          title="Money Lent"
          value={formatCurrency(summary.moneyLent.total)}
          subtitle={summary.moneyLent.count > 0 ? `${summary.moneyLent.count} people` : undefined}
          icon={HandCoins}
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MonthlyTrendChart income={summary.monthlyIncome} expense={summary.monthlyExpense} />
        <ExpenseCategoryTable categories={summary.expenseByCategory} />
      </div>

      <RecentTransactions transactions={summary.recentTransactions} />
    </div>
  );
}
