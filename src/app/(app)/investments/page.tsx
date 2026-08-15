import { auth } from "@/auth";
import { getInvestmentEntries } from "@/lib/data";
import { InvestmentFormDialog } from "@/components/investment/investment-form-dialog";
import { InvestmentList } from "@/components/investment/investment-list";

export default async function InvestmentsPage() {
  const session = await auth();
  const entries = await getInvestmentEntries(session!.user.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <InvestmentFormDialog mode="create" />
      </div>
      <InvestmentList entries={entries} />
    </div>
  );
}
