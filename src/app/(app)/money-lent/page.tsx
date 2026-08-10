import { auth } from "@/auth";
import { getMoneyLentEntries } from "@/lib/data";
import { MoneyLentFormDialog } from "@/components/money-lent/money-lent-form-dialog";
import { MoneyLentList } from "@/components/money-lent/money-lent-list";

export default async function MoneyLentPage() {
  const session = await auth();
  const entries = await getMoneyLentEntries(session!.user.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <MoneyLentFormDialog mode="create" />
      </div>
      <MoneyLentList entries={entries} />
    </div>
  );
}
