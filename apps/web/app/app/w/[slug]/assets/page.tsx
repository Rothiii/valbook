'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use } from 'react';

import { AssetTable } from '@/src/features/asset/components/asset-table';
import { CsvImportDialog } from '@/src/features/valuation/components/csv-import-dialog';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { Button } from '@/src/shared/ui/button';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function AssetsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Assets"
        description="All assets in this workspace."
        actions={
          <>
            <CsvImportDialog workspaceId={workspace.id} />
            <Button asChild>
              <Link href={`/app/w/${slug}/assets/new`}>+ Add asset</Link>
            </Button>
          </>
        }
      />
      <AssetTable workspaceId={workspace.id} workspaceSlug={slug} />
    </div>
  );
}
