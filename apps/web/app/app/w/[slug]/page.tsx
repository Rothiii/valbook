'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use } from 'react';

import { ActivityFeed } from '@/src/features/activity/components/activity-feed';
import { useAssetStats } from '@/src/features/asset/hooks/use-asset-stats';
import { useCategories } from '@/src/features/category/hooks/use-categories';
import { useConvert } from '@/src/features/currency/hooks/use-currency';
import { useOwnerLabels } from '@/src/features/owner-label/hooks/use-owner-labels';
import { useWorkspaceGrowth } from '@/src/features/valuation/hooks/use-workspace-growth';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { PageHeader } from '@/src/shared/ui/page-header';
import { formatMoney } from '@/src/shared/utils/format';

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
  const convert = useConvert();
  const display = workspace.displayCurrency;
  const unsupported: string[] = [];
  let convertedTotal = 0;
  for (const [cur, amt] of totalValueEntries) {
    const v = convert(amt, cur, display);
    if (v === null) unsupported.push(cur);
    else convertedTotal += v;
  }

  const growth = useWorkspaceGrowth(workspace.id, display, 30);

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
              <>
                <p className="text-2xl">{formatMoney(convertedTotal, display)}</p>
                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {totalValueEntries.map(([currency, total]) => (
                    <li key={currency}>{formatMoney(total, currency)}</li>
                  ))}
                </ul>
                {unsupported.length > 0 ? (
                  <p className="mt-2 text-xs text-destructive">
                    Missing rate for {unsupported.join(', ')}
                  </p>
                ) : null}
              </>
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
            {growth.hasBaseline && growth.percent !== null ? (
              <>
                <p
                  className={`text-2xl ${growth.percent >= 0 ? 'text-emerald-600' : 'text-destructive'}`}
                >
                  {growth.percent >= 0 ? '+' : ''}
                  {growth.percent.toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {growth.delta >= 0 ? '+' : ''}
                  {formatMoney(growth.delta, display)}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl text-muted-foreground">—</p>
                <p className="text-xs text-muted-foreground">Add valuations ≥30d ago</p>
              </>
            )}
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
