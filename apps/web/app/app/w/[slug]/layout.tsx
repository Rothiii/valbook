import type * as React from 'react';

import { AppTopbar } from '@/src/shared/ui/app-topbar';
import { WorkspaceSidebar } from '@/src/shared/ui/workspace-sidebar';
import { WorkspaceSwitcher } from '@/src/shared/ui/workspace-switcher';

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
      <AppTopbar
        workspaceSwitcher={<WorkspaceSwitcher current={{ slug, name: slug }} workspaces={[]} />}
      />
      <div className="flex flex-1">
        <WorkspaceSidebar slug={slug} />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
