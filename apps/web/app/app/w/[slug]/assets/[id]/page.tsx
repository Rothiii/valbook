'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use } from 'react';

import { AssetDetail } from '@/src/features/asset/components/asset-detail';
import { useAsset } from '@/src/features/asset/hooks/use-assets';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';

export default function AssetDetailPage({
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
    <div className="mx-auto max-w-5xl">
      <div className="mb-4">
        <Link href={`/app/w/${slug}/assets`} className="text-xs text-muted-foreground underline">
          ← Back to assets
        </Link>
      </div>
      <AssetDetail asset={asset} workspaceSlug={slug} />
    </div>
  );
}
