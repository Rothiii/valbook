'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { CategoryList } from '@/src/features/category/components/category-list';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function CategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Categories"
        description="Define asset types. Custom fields per category land in Phase 2."
      />
      <CategoryList workspaceId={workspace.id} />
    </div>
  );
}
