import type * as React from 'react';

import { WorkspaceSwitcherLive } from '@/src/features/workspace/components/workspace-switcher-live';
import { AppTopbar } from '@/src/shared/ui/app-topbar';
import { WorkspaceSidebar } from '@/src/shared/ui/workspace-sidebar';

export default async function WorkspaceLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppTopbar workspaceSwitcher={<WorkspaceSwitcherLive currentSlug={slug} />} />
      <div className="flex flex-1">
        <WorkspaceSidebar slug={slug} />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
