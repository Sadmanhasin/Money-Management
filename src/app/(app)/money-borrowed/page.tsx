import { auth } from "@/auth";
import { getMoneyBorrowedEntries } from "@/lib/data";
import { MoneyBorrowedFormDialog } from "@/components/money-borrowed/money-borrowed-form-dialog";
import { MoneyBorrowedList } from "@/components/money-borrowed/money-borrowed-list";

export default async function MoneyBorrowedPage() {
  const session = await auth();
  const entries = await getMoneyBorrowedEntries(session!.user.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <MoneyBorrowedFormDialog mode="create" />
      </div>
      <MoneyBorrowedList entries={entries} />
    </div>
  );
}
