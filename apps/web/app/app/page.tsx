import type { Metadata } from 'next';
import Link from 'next/link';

import { WorkspaceList } from '@/src/features/workspace/components/workspace-list';
import { AppTopbar } from '@/src/shared/ui/app-topbar';
import { Button } from '@/src/shared/ui/button';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Workspaces · Valbook' };

export default function WorkspacesPage() {
  return (
    <>
      <AppTopbar />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <PageHeader
          title="Workspaces"
          description="All workspaces you're a member of."
          actions={
            <Button asChild>
              <Link href="/onboarding">+ New workspace</Link>
            </Button>
          }
        />
        <WorkspaceList />
      </div>
    </>
  );
}
