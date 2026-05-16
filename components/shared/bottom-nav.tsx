"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  DollarSign,
  SettingsIcon,
  CheckCircle,
  Building2,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: (pathname: string) => boolean;
}

interface BottomNavProps {
  isManager: boolean;
  isFinanceManager: boolean;
  userOrg: { id: string } | null;
}

export function BottomNav({ isManager, isFinanceManager, userOrg }: BottomNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      icon: HomeIcon,
      label: "Home",
      isActive: (p) => p === "/dashboard",
    },
    {
      href: "/dashboard/expenses",
      icon: DollarSign,
      label: "Expenses",
      isActive: (p) => p.startsWith("/dashboard/expenses"),
    },
    ...(isManager
      ? [
          {
            href: "/dashboard/manager/approvals",
            icon: CheckCircle,
            label: "Approvals",
            isActive: (p: string) => p === "/dashboard/manager/approvals",
          },
        ]
      : []),
    ...(isFinanceManager
      ? [
          {
            href: "/dashboard/finance/reimbursements",
            icon: Landmark,
            label: "Finance",
            isActive: (p: string) =>
              p === "/dashboard/finance/reimbursements",
          },
        ]
      : []),
    ...(userOrg
      ? [
          {
            href: `/dashboard/organizations/${userOrg.id}`,
            icon: Building2,
            label: "Org",
            isActive: (p: string) =>
              p.startsWith(`/dashboard/organizations/${userOrg.id}`),
          },
        ]
      : []),
    {
      href: "/dashboard/settings",
      icon: SettingsIcon,
      label: "Settings",
      isActive: (p) => p === "/dashboard/settings",
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-3 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="size-5"
                fill={active ? "currentColor" : "none"}
                strokeWidth={active ? 1 : 2}
              />
              <span
                className={cn(
                  "text-[10px] leading-none",
                  active ? "font-semibold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
