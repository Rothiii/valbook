'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { SharingManager } from '@/src/features/sharing/components/sharing-manager';
import {
  useCurrentMembership,
  useWorkspaceBySlug,
} from '@/src/features/workspace/hooks/use-workspaces';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function SharingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  const membership = useCurrentMembership(workspace?.id);
  if (!workspace) notFound();

  if (membership.role !== 'owner') {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Sharing" description="Public read-only links." />
        <EmptyState
          title="Owner only"
          description="Only workspace owners can manage public sharing."
        />
      </div>
    );
  }

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
