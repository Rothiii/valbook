'use client';

import { useMemo } from 'react';
import { useAssetChildren, useAssets } from '@/src/features/asset/hooks/use-assets';
import { useAssetStore } from '@/src/features/asset/store';
import { useCategoryStore } from '@/src/features/category/store';
import { useOwnerLabelStore } from '@/src/features/owner-label/store';
import { useWorkspaceStore } from '@/src/features/workspace/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card';

import { useShareByToken } from '../hooks/use-shares';

export function PublicView({ token }: { token: string }) {
  const share = useShareByToken(token);
  const workspace = useWorkspaceStore((s) =>
    share ? (s.workspaces.find((w) => w.id === share.workspaceId) ?? null) : null,
  );
  const assetForScope = useAssetStore((s) =>
    share?.scope === 'asset' ? (s.assets.find((a) => a.id === share.targetId) ?? null) : null,
  );

  const status = useMemo(() => {
    if (!share) return 'invalid' as const;
    if (share.revokedAt) return 'revoked' as const;
    if (share.expiresAt && new Date(share.expiresAt).getTime() < Date.now())
      return 'expired' as const;
    if (!workspace) return 'missing' as const;
    return 'ok' as const;
  }, [share, workspace]);

  if (status !== 'ok' || !share || !workspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {status === 'invalid' && 'Link not found.'}
            {status === 'expired' && 'This share link has expired.'}
            {status === 'revoked' && 'This share link has been revoked.'}
            {status === 'missing' && 'Workspace no longer exists.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-muted/30 px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            👁 Read-only view · Valbook
          </p>
          <p className="text-xs text-muted-foreground">
            Shared {new Date(share.createdAt).toLocaleDateString()}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {share.scope === 'workspace' ? (
          <WorkspaceView
            workspaceId={workspace.id}
            workspaceName={workspace.name}
            displayCurrency={workspace.displayCurrency}
          />
        ) : assetForScope ? (
          <AssetView assetId={assetForScope.id} />
        ) : (
          <p className="text-sm text-muted-foreground">Target asset not found.</p>
        )}
      </div>

      <footer className="mt-12 border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        Powered by Valbook
      </footer>
    </main>
  );
}

function WorkspaceView({
  workspaceId,
  workspaceName,
  displayCurrency,
}: {
  workspaceId: string;
  workspaceName: string;
  displayCurrency: string;
}) {
  const assets = useAssets(workspaceId, { includeArchived: false });
  const categories = useCategoryStore((s) =>
    s.categories.filter((c) => c.workspaceId === workspaceId),
  );
  const owners = useOwnerLabelStore((s) => s.owners.filter((o) => o.workspaceId === workspaceId));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const ownerMap = new Map(owners.map((o) => [o.id, o.name]));

  return (
    <>
      <h1 className="mb-2 text-2xl">{workspaceName}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {assets.length} assets · {displayCurrency}
      </p>

      <ul className="divide-y divide-border border border-border">
        {assets.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p>{a.name}</p>
              <p className="text-xs text-muted-foreground">
                {a.categoryId ? (categoryMap.get(a.categoryId) ?? '—') : '—'}
                {a.ownerLabelId ? ` · ${ownerMap.get(a.ownerLabelId) ?? '—'}` : ''}
              </p>
            </div>
            <p className="text-sm">
              {a.currentValue ? `${a.currentCurrency ?? ''} ${a.currentValue}` : '—'}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

function AssetView({ assetId }: { assetId: string }) {
  const asset = useAssetStore((s) => s.assets.find((a) => a.id === assetId) ?? null);
  const children = useAssetChildren(assetId);
  const categories = useCategoryStore((s) => s.categories);
  const owners = useOwnerLabelStore((s) => s.owners);
  if (!asset) return <p className="text-sm text-muted-foreground">Asset not found.</p>;
  const category = categories.find((c) => c.id === asset.categoryId);
  const owner = owners.find((o) => o.id === asset.ownerLabelId);

  return (
    <>
      <h1 className="mb-2 text-2xl">{asset.name}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {asset.status}
        {category ? ` · ${category.name}` : ''}
        {owner ? ` · ${owner.name}` : ''}
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Current value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">
              {asset.currentValue ? `${asset.currentCurrency ?? ''} ${asset.currentValue}` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Sub-assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{children.length}</p>
          </CardContent>
        </Card>
      </div>

      {children.length > 0 ? (
        <>
          <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
            Sub-assets
          </h2>
          <ul className="divide-y divide-border border border-border">
            {children.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>{c.name}</span>
                <span className="text-muted-foreground">
                  {c.currentValue ? `${c.currentCurrency ?? ''} ${c.currentValue}` : '—'}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}
