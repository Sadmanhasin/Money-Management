import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/current-user";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const currentUser = await getCurrentUser(session.user.id);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar userName={currentUser?.name} userEmail={currentUser?.email ?? session.user.email ?? ""} />
        <main className="flex-1 overflow-x-hidden bg-muted/20 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
