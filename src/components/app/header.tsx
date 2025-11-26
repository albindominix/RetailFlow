"use client";

import {
  User,
  Crown,
  Briefcase,
  ChevronDown,
  Signal,
  SignalZero,
  LogOut,
  Menu,
  Wallet,
} from "lucide-react";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppContext } from "@/hooks/use-app-context";
import type { Role } from "@/lib/definitions";
import { useAccessControl } from "@/hooks/use-access-control";
import type { Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";


interface NavItem {
  href: string;
  label: string;
  permission: Permission;
}

const navItems: NavItem[] = [
  { href: "/pos", label: "POS", permission: "pos.create" },
  { href: "/refunds", label: "Refunds", permission: "pos.refunds" },
  { href: "/inventory", label: "Inventory", permission: "inventory.view" },
  { href: "/procurement", label: "Procurement", permission: "procurement.manage" },
  { href: "/stock-adjustment", label: "Stock Adjust", permission: "stock_adjustment.create"},
  { href: "/reports", label: "Reports", permission: "reports.view_financials" },
  { href: "/admin", label: "Admin", permission: "admin.manage_users" },
];


const roleIcons: Record<Role, React.ElementType> = {
  Cashier: Briefcase,
  Manager: User,
  Owner: Crown,
};

export function AppHeader() {
  const { state, setRole, dispatch } = useAppContext();
  const { role } = state;
  const RoleIcon = role ? roleIcons[role] : User;
  const { canAccess } = useAccessControl();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
               <Link
                href="#"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Wallet className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">RetailFlow</span>
              </Link>
              {navItems.map((item) => (
                canAccess(item.permission) && (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                      pathname.startsWith(item.href) && 'text-foreground'
                      )}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <Button variant={state.online ? "outline" : "destructive"} size="sm" onClick={() => dispatch({ type: 'TOGGLE_ONLINE_STATUS' })}>
          {state.online ? <Signal className="h-4 w-4 mr-2" /> : <SignalZero className="h-4 w-4 mr-2" />}
          {state.online ? "Online" : "Offline"}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="pl-3 pr-2">
              <RoleIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{role}</span>
              <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRole("Cashier")}>
              <Briefcase className="mr-2 h-4 w-4" />
              Cashier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRole("Manager")}>
              <User className="mr-2 h-4 w-4" />
              Manager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRole("Owner")}>
              <Crown className="mr-2 h-4 w-4" />
              Owner
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <User />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => window.location.href = '/'}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
