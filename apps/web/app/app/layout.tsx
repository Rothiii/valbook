import type * as React from 'react';

import { AuthGuard } from '@/src/features/auth/components/auth-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
