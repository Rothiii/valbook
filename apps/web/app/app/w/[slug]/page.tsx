'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use } from 'react';

import { ActivityFeed } from '@/src/features/activity/components/activity-feed';
import { useAssetStats } from '@/src/features/asset/hooks/use-asset-stats';
import { useCategories } from '@/src/features/category/hooks/use-categories';
import { useOwnerLabels } from '@/src/features/owner-label/hooks/use-owner-labels';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const stats = useAssetStats(workspace.id);
  const categories = useCategories(workspace.id);
  const owners = useOwnerLabels(workspace.id);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const ownerMap = new Map(owners.map((o) => [o.id, o]));

  const totalValueEntries = Object.entries(stats.totalValueByCurrency);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Dashboard"
        description={`Overview for ${workspace.name}`}
        actions={
          <Button asChild>
            <Link href={`/app/w/${slug}/assets/new`}>+ Add asset</Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Total value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalValueEntries.length === 0 ? (
              <p className="text-2xl">—</p>
            ) : (
              <ul className="space-y-1">
                {totalValueEntries.map(([currency, total]) => (
                  <li key={currency} className="text-2xl">
                    {currency} {total.toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Active assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{stats.active}</p>
            <p className="text-xs text-muted-foreground">{stats.archived} archived</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Growth 1M
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-muted-foreground">Phase 3</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By category</CardTitle>
            <CardDescription>Active asset count per category.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.byCategory.size === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2">
                {[...stats.byCategory.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([id, count]) => {
                    const cat = categoryMap.get(id);
                    return (
                      <li key={id} className="flex items-center justify-between text-sm">
                        <span>{cat?.name ?? 'Uncategorized'}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By owner</CardTitle>
            <CardDescription>Active asset count per owner.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.byOwner.size === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2">
                {[...stats.byOwner.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([id, count]) => {
                    const owner = ownerMap.get(id);
                    return (
                      <li key={id} className="flex items-center justify-between text-sm">
                        <span>{owner?.name ?? 'Unassigned'}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed workspaceId={workspace.id} limit={10} />
        </CardContent>
      </Card>
    </div>
  );
}
