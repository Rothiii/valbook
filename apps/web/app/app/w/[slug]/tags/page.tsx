'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { TagList } from '@/src/features/tag/components/tag-list';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function TagsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Tags" description="Multi-value labels for assets across categories." />
      <TagList workspaceId={workspace.id} />
    </div>
  );
}
