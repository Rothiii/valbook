import Link from 'next/link';
import type * as React from 'react';

import { Button } from '@/src/shared/ui/button';
import { ThemeToggle } from '@/src/shared/ui/theme-toggle';

export type AppTopbarProps = {
  workspaceSwitcher?: React.ReactNode;
  search?: React.ReactNode;
  actions?: React.ReactNode;
};

export function AppTopbar({ workspaceSwitcher, search, actions }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
      <Link href="/app" className="text-sm uppercase tracking-wider">
        Valbook
      </Link>
      {workspaceSwitcher ? (
        <>
          <span className="text-muted-foreground">/</span>
          {workspaceSwitcher}
        </>
      ) : null}
      <div className="flex-1">{search}</div>
      <div className="flex items-center gap-2">
        {actions}
        <ThemeToggle />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/account">Account</Link>
        </Button>
      </div>
    </header>
  );
}
