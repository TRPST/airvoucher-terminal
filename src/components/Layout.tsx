'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOutUser } from '@/actions/userActions';
import { LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTerminal } from '@/contexts/TerminalContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [supabaseClient] = React.useState(() => createClient());
  const [user, setUser] = React.useState<any>(null);
  const [, setSession] = React.useState<any>(null);
  const { terminalName, retailerName, balance, availableCredit, isBalanceLoading } = useTerminal();

  // Fetch user session on component mount
  React.useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);

      const { data: authListener } = supabaseClient.auth.onAuthStateChange(
        (event: string, currentSession: any) => {
          setSession(currentSession);
          setUser(currentSession?.user || null);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    fetchSession();
  }, [supabaseClient]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { error } = await signOutUser();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Calculate values for display
  const balanceDisplay = balance.toFixed(2);
  const creditDisplay = availableCredit.toFixed(2);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div
        className="sticky top-0 z-20 flex items-center justify-between bg-background pb-2 pl-4 pr-4 pt-4 sm:border-b sm:border-border"
        key={`cashier-header-${balanceDisplay}-${creditDisplay}`}
      >
        <div className="flex items-center">
          <img src="/assets/airvoucher-logo.png" alt="AirVoucher Logo" className="mr-2 h-8" />
          <span className="font-bold">
            {terminalName && retailerName
              ? `${retailerName} ${window.innerWidth < 640 ? '' : ' • '}${terminalName}`
              : 'AirVoucher Terminal'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isBalanceLoading ? (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-10 w-36 animate-pulse rounded-md bg-green-100/50 dark:bg-green-950/20"></div>
              <div className="h-10 w-36 animate-pulse rounded-md bg-amber-100/50 dark:bg-amber-950/20"></div>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex items-center rounded-md bg-green-100 px-4 py-2 font-medium text-green-700 dark:bg-green-950/30 dark:text-green-500">
                Balance: <span className="ml-1 font-bold">R{balanceDisplay}</span>
              </div>
              <div className="flex items-center rounded-md bg-amber-100 px-4 py-2 font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-500">
                Credit: <span className="ml-1 font-bold">R{creditDisplay}</span>
              </div>
            </div>
          )}
          <ThemeToggle />
          {user && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="rounded-md p-2 outline-none transition-colors hover:bg-muted"
                  aria-label="User menu"
                >
                  <Avatar.Root className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
                    <Avatar.Fallback>
                      {user.email ? user.email.charAt(0).toUpperCase() : 'C'}
                    </Avatar.Fallback>
                  </Avatar.Root>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-[200px] overflow-hidden rounded-md border border-border bg-background p-1 shadow-md animate-in fade-in-0 zoom-in-95 duration-200"
                >
                  <div className="mb-1 border-b border-border px-3 py-2">
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-muted"
                    onSelect={handleSignOut}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </div>

      <div className="sticky top-[70px] z-20 w-full border-b bg-background p-3 sm:hidden">
        {isBalanceLoading ? (
          <div className="flex w-full items-center gap-2">
            <div className="h-10 flex-1 animate-pulse rounded-md bg-green-100/50 dark:bg-green-950/20"></div>
            <div className="h-10 flex-1 animate-pulse rounded-md bg-amber-100/50 dark:bg-amber-950/20"></div>
          </div>
        ) : (
          <div className="flex w-full items-center gap-2">
            <div className="flex flex-1 items-center justify-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-950/30 dark:text-green-500">
              Balance: <span className="ml-1 font-bold">R{balanceDisplay}</span>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-500">
              Credit: <span className="ml-1 font-bold">R{creditDisplay}</span>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
