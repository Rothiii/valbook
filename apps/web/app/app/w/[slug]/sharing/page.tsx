'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { SharingManager } from '@/src/features/sharing/components/sharing-manager';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function SharingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Sharing"
        description="Public read-only links to this workspace or specific assets."
      />
      <SharingManager workspaceId={workspace.id} workspaceName={workspace.name} />
    </div>
  );
}
