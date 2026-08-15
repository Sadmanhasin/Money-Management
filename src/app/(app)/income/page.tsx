import { auth } from "@/auth";
import { getAvailableYears, getIncomes } from "@/lib/data";
import { ListFilters } from "@/components/shared/list-filters";
import { IncomeFormDialog } from "@/components/income/income-form-dialog";
import { IncomeTable } from "@/components/income/income-table";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; month?: string; year?: string }>;
}) {
  const session = await auth();
  const filters = await searchParams;
  const [incomes, years] = await Promise.all([
    getIncomes(session!.user.id, filters),
    getAvailableYears(session!.user.id),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ListFilters years={years} searchPlaceholder="Search by source..." />
        <IncomeFormDialog mode="create" />
      </div>
      <IncomeTable incomes={incomes} />
    </div>
  );
}
