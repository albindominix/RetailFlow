"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  Wallet,
  Truck,
  ArrowLeftRight,
  Settings,
  PackagePlus,
  ReceiptText,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAccessControl } from "@/hooks/use-access-control";
import { cn } from "@/lib/utils";
import type { Permission } from "@/lib/permissions";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  permission: Permission;
}

const navItems: NavItem[] = [
  { href: "/pos", icon: ShoppingCart, label: "POS", permission: "pos.create" },
  { href: "/sales", icon: ReceiptText, label: "Sales", permission: "sales.view" },
  { href: "/refunds", icon: ArrowLeftRight, label: "Refunds", permission: "pos.refunds" },
  { href: "/inventory", icon: Package, label: "Inventory", permission: "inventory.view" },
  { href: "/procurement", icon: Truck, label: "Procurement", permission: "procurement.manage" },
  { href: "/stock-adjustment", icon: PackagePlus, label: "Stock Adjust", permission: "stock_adjustment.create"},
  { href: "/reports", icon: LineChart, label: "Reports", permission: "reports.view_financials" },
  { href: "/admin", icon: Settings, label: "Admin", permission: "admin.manage_users" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { canAccess } = useAccessControl();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/pos"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Wallet className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">RetailFlow</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) =>
            canAccess(item.permission) ? (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                      pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : null
          )}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
