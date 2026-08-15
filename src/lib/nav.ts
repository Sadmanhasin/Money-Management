import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  HandCoins,
  Landmark,
  PiggyBank,
  BarChart3,
  UserCircle,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: ArrowUpCircle },
  { href: "/expenses", label: "Expenses", icon: ArrowDownCircle },
  { href: "/money-lent", label: "Money Lent", icon: HandCoins },
  { href: "/money-borrowed", label: "Money Borrowed", icon: Landmark },
  { href: "/investments", label: "Investments", icon: PiggyBank },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserCircle },
] as const;
