"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wallet, LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/shared/user-avatar";
import { IncomeFormDialog } from "@/components/income/income-form-dialog";
import { ExpenseFormDialog } from "@/components/expense/expense-form-dialog";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/income": "Income",
  "/expenses": "Expenses",
  "/profile": "Profile",
};

export function Topbar({
  userName,
  userEmail,
}: {
  userName?: string | null;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title =
    PAGE_TITLES[Object.keys(PAGE_TITLES).find((key) => pathname.startsWith(key)) ?? ""] ??
    "Money Management";

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b bg-background/95 px-3 py-2.5 backdrop-blur-sm md:px-6 md:py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center gap-2">
                <Wallet className="size-5 text-primary" />
                Money Management
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-1 p-3">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <form action={logoutAction} className="border-t p-3">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </form>
          </SheetContent>
        </Sheet>
        <h1 className="truncate text-base font-semibold md:text-lg">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <IncomeFormDialog mode="create" />
        <ExpenseFormDialog mode="create" />
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-accent sm:pr-3"
        >
          <UserAvatar name={userName} email={userEmail} size="sm" />
          <span className="hidden max-w-32 truncate text-sm font-medium md:inline">
            {userName || userEmail}
          </span>
        </Link>
      </div>
    </header>
  );
}
