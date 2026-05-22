'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use } from 'react';

import { AssetForm } from '@/src/features/asset/components/asset-form';
import { useAsset } from '@/src/features/asset/hooks/use-assets';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { Card, CardContent } from '@/src/shared/ui/card';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function EditAssetPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  const asset = useAsset(id);

  if (!workspace) notFound();
  if (!asset || asset.workspaceId !== workspace.id) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <Link
          href={`/app/w/${slug}/assets/${id}`}
          className="text-xs text-muted-foreground underline"
        >
          ← Back to asset
        </Link>
      </div>
      <PageHeader title={`Edit ${asset.name}`} description="Update fields, tags, owner, etc." />
      <Card>
        <CardContent className="pt-6">
          <AssetForm workspace={workspace} asset={asset} />
        </CardContent>
      </Card>
    </div>
  );
}
