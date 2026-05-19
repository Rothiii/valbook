'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { AssetForm } from '@/src/features/asset/components/asset-form';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { Card, CardContent } from '@/src/shared/ui/card';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function NewAssetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add asset" description="Create a new asset in this workspace." />
      <Card>
        <CardContent className="pt-6">
          <AssetForm workspace={workspace} />
        </CardContent>
      </Card>
    </div>
  );
}
