"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  FileText,
  ShoppingCart,
  History,
  User,
  Percent,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react";
import {
  useSupabaseClient,
  useSessionContext,
} from "@supabase/auth-helpers-react";

import { cn } from "@/utils/cn";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type UserRole = "admin" | "retailer" | "agent";

interface LayoutProps {
  children: React.ReactNode;
  role?: UserRole;
}

export function Layout({ children, role = "admin" }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const supabase = useSupabaseClient();
  const { session } = useSessionContext();

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Generate navigation items based on user role
  const getNavItems = (role: UserRole) => {
    switch (role) {
      case "admin":
        return [
          {
            name: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
          },
          {
            name: "Retailers",
            href: "/admin/retailers",
            icon: Store,
          },
          {
            name: "Vouchers",
            href: "/admin/vouchers",
            icon: CreditCard,
          },
          {
            name: "Commissions",
            href: "/admin/commissions",
            icon: Percent,
          },
          {
            name: "Reports",
            href: "/admin/reports",
            icon: FileText,
          },
        ];
      case "retailer":
        return [
          {
            name: "Sell",
            href: "/retailer",
            icon: ShoppingCart,
          },
          {
            name: "History",
            href: "/retailer/history",
            icon: History,
          },
          {
            name: "Account",
            href: "/retailer/account",
            icon: User,
          },
        ];
      case "agent":
        return [
          {
            name: "Dashboard",
            href: "/agent",
            icon: LayoutDashboard,
          },
          {
            name: "Retailers",
            href: "/agent/retailers",
            icon: Store,
          },
          {
            name: "Commissions",
            href: "/agent/commissions",
            icon: Percent,
          },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(role);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Mobile top nav */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background p-4 md:hidden">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-2 rounded-md p-2 hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold">AirVoucher</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Mobile sidebar (drawer) */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 animate-in slide-in-from-left border-r border-border bg-background p-4 md:hidden">
            <div className="flex justify-end">
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-2 hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">AirVoucher</h1>
                {session ? (
                  <button
                    onClick={handleSignOut}
                    className="rounded-md p-1.5 hover:bg-muted transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="rounded-md p-1.5 hover:bg-muted transition-colors"
                    aria-label="Exit to landing page"
                  >
                    <LogOut className="h-5 w-5" />
                  </Link>
                )}
              </div>
              <div className="mt-4 rounded-full bg-primary py-1 px-4 text-center text-sm font-medium text-primary-foreground">
                {role.charAt(0).toUpperCase() + role.slice(1)} Portal
              </div>
            </div>
            <nav className="mt-8 flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  © 2025 AirVoucher
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border bg-background p-4 md:block">
        <div className="flex h-full flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">AirVoucher</h1>
              {session ? (
                <button
                  onClick={handleSignOut}
                  className="rounded-md p-1.5 hover:bg-muted transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              ) : (
                <Link
                  href="/"
                  className="rounded-md p-1.5 hover:bg-muted transition-colors"
                  aria-label="Exit to landing page"
                >
                  <LogOut className="h-5 w-5" />
                </Link>
              )}
            </div>
            <div className="mt-4 rounded-full bg-primary py-1 px-4 text-center text-sm font-medium text-primary-foreground">
              {role.charAt(0).toUpperCase() + role.slice(1)} Portal
            </div>
          </div>
          <nav className="mt-8 flex flex-1 flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100",
                    pathname === item.href ? "opacity-100" : ""
                  )}
                />
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                © 2025 AirVoucher
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:pl-64">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
