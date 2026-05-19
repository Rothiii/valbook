'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { ActivityFeedFiltered } from '@/src/features/activity/components/activity-feed-filtered';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Activity" description="All mutations in this workspace." />
      <ActivityFeedFiltered workspaceId={workspace.id} />
    </div>
  );
}
