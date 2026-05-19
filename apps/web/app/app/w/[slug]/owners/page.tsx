'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { OwnerLabelList } from '@/src/features/owner-label/components/owner-label-list';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function OwnersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Owner labels"
        description="Track who owns each asset (person, company, joint, etc)."
      />
      <OwnerLabelList workspaceId={workspace.id} />
    </div>
  );
}
