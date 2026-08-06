import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, UserCircle } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: ArrowUpCircle },
  { href: "/expenses", label: "Expenses", icon: ArrowDownCircle },
  { href: "/profile", label: "Profile", icon: UserCircle },
] as const;
