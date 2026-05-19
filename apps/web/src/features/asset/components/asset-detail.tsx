'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ActivityFeed } from '@/src/features/activity/components/activity-feed';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { useCategory } from '@/src/features/category/hooks/use-categories';
import { useOwnerLabel } from '@/src/features/owner-label/hooks/use-owner-labels';
import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/shared/ui/tabs';

import { useAssetActions, useAssetChildren } from '../hooks/use-assets';
import type { Asset } from '../types';

export type AssetDetailProps = {
  asset: Asset;
  workspaceSlug: string;
};

export function AssetDetail({ asset, workspaceSlug }: AssetDetailProps) {
  const router = useRouter();
  const { user } = useSession();
  const category = useCategory(asset.categoryId);
  const owner = useOwnerLabel(asset.ownerLabelId);
  const children = useAssetChildren(asset.id);
  const { archiveAsset, unarchiveAsset, deleteAsset } = useAssetActions();

  function handleArchiveToggle() {
    if (!user) return;
    try {
      if (asset.status === 'archived') {
        unarchiveAsset({ id: asset.id, actorId: user.id, actorName: user.name });
        toast.success('Asset unarchived');
      } else {
        archiveAsset({ id: asset.id, actorId: user.id, actorName: user.name });
        toast.success('Asset archived');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed');
    }
  }

  function handleDelete() {
    if (!user) return;
    if (!confirm(`Permanently delete "${asset.name}"?`)) return;
    deleteAsset({ id: asset.id, actorId: user.id, actorName: user.name });
    toast.success('Asset deleted');
    router.push(`/app/w/${workspaceSlug}/assets`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl">{asset.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
              {asset.status}
            </Badge>
            {category ? (
              <>
                <span>·</span>
                <span>{category.name}</span>
              </>
            ) : null}
            {owner ? (
              <>
                <span>·</span>
                <span>{owner.name}</span>
              </>
            ) : null}
            {asset.location ? (
              <>
                <span>·</span>
                <span>{asset.location}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/app/w/${workspaceSlug}/assets/${asset.id}/edit`)}
            disabled
          >
            Edit
          </Button>
          <Button variant="outline" onClick={handleArchiveToggle}>
            {asset.status === 'archived' ? 'Unarchive' : 'Archive'}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
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
              Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">
              {asset.purchasePrice ? `${asset.purchaseCurrency ?? ''} ${asset.purchasePrice}` : '—'}
            </p>
            {asset.purchaseDate ? (
              <p className="text-xs text-muted-foreground">{asset.purchaseDate}</p>
            ) : null}
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="children">Sub-assets ({children.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-3">
          {asset.code ? <DetailRow label="Code" value={asset.code} /> : null}
          {asset.location ? <DetailRow label="Location" value={asset.location} /> : null}
          {asset.notes ? (
            <div className="border border-border p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{asset.notes}</p>
            </div>
          ) : null}
        </TabsContent>
        <TabsContent value="valuation" className="mt-4">
          <p className="text-sm text-muted-foreground">Valuation history (Phase 3).</p>
        </TabsContent>
        <TabsContent value="attachments" className="mt-4">
          <p className="text-sm text-muted-foreground">Attachments (Phase 4).</p>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <ActivityFeed workspaceId={asset.workspaceId} />
        </TabsContent>
        <TabsContent value="children" className="mt-4">
          {children.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sub-assets.</p>
          ) : (
            <ul className="divide-y divide-border border border-border">
              {children.map((c) => (
                <li key={c.id} className="px-4 py-2 text-sm">
                  {c.name}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-border py-2 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="col-span-2">{value}</p>
    </div>
  );
}
