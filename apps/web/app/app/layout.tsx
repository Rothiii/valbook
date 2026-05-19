import type * as React from 'react';

import { AppTopbar } from '@/src/shared/ui/app-topbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppTopbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
