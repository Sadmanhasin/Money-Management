import { auth } from "@/auth";
import { getAvailableYears, getExpenses } from "@/lib/data";
import { ListFilters } from "@/components/shared/list-filters";
import { ExpenseFormDialog } from "@/components/expense/expense-form-dialog";
import { ExpenseTable } from "@/components/expense/expense-table";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; month?: string; year?: string }>;
}) {
  const session = await auth();
  const filters = await searchParams;
  const [expenses, years] = await Promise.all([
    getExpenses(session!.user.id, filters),
    getAvailableYears(session!.user.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ListFilters years={years} searchPlaceholder="Search by category or note..." />
        <ExpenseFormDialog mode="create" />
      </div>
      <ExpenseTable expenses={expenses} />
    </div>
  );
}
