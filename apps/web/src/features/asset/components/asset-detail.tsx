'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ActivityFeed } from '@/src/features/activity/components/activity-feed';
import { AttachmentTab } from '@/src/features/attachment/components/attachment-tab';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { useCategory } from '@/src/features/category/hooks/use-categories';
import { useCategoryFields } from '@/src/features/category/hooks/use-fields';
import { useOwnerLabel } from '@/src/features/owner-label/hooks/use-owner-labels';
import { useAssetTagIds, useTags } from '@/src/features/tag/hooks/use-tags';
import { ValuationTab } from '@/src/features/valuation/components/valuation-tab';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { notify } from '@/src/shared/lib/notify';
import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/shared/ui/tabs';
import { formatMoney } from '@/src/shared/utils/format';
import { useAssetAncestors } from '../hooks/use-asset-tree';
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
  const fields = useCategoryFields(asset.categoryId);
  const owner = useOwnerLabel(asset.ownerLabelId);
  const children = useAssetChildren(asset.id);
  const ancestors = useAssetAncestors(asset);
  const workspace = useWorkspaceBySlug(workspaceSlug);
  const allTags = useTags(asset.workspaceId);
  const assignedTagIds = useAssetTagIds(asset.id);
  const assignedTags = allTags.filter((t) => assignedTagIds.includes(t.id));
  const { archiveAsset, unarchiveAsset, deleteAsset } = useAssetActions();

  function handleArchiveToggle() {
    if (!user) return;
    try {
      if (asset.status === 'archived') {
        unarchiveAsset({ id: asset.id, actorId: user.id, actorName: user.name });
        notify.success('Asset unarchived');
      } else {
        archiveAsset({ id: asset.id, actorId: user.id, actorName: user.name });
        notify.success('Asset archived');
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed');
    }
  }

  function handleDelete() {
    if (!user) return;
    if (!confirm(`Permanently delete "${asset.name}"?`)) return;
    deleteAsset({ id: asset.id, actorId: user.id, actorName: user.name });
    notify.success('Asset deleted');
    router.push(`/app/w/${workspaceSlug}/assets`);
  }

  return (
    <div className="space-y-6">
      {ancestors.length > 0 ? (
        <nav className="text-xs text-muted-foreground">
          {ancestors.map((a, idx) => (
            <span key={a.id}>
              <Link href={`/app/w/${workspaceSlug}/assets/${a.id}`} className="underline">
                {a.name}
              </Link>
              {idx < ancestors.length ? <span className="px-1">/</span> : null}
            </span>
          ))}
          <span className="text-foreground">{asset.name}</span>
        </nav>
      ) : null}
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
          {assignedTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {assignedTags.map((t) => (
                <Badge
                  key={t.id}
                  variant="secondary"
                  style={t.color ? { background: t.color, color: '#fafafa' } : undefined}
                >
                  {t.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/app/w/${workspaceSlug}/assets/${asset.id}/edit`)}
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
            <p className="text-2xl">{formatMoney(asset.currentValue, asset.currentCurrency)}</p>
            {asset.quantity && asset.unitCurrentPrice ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {asset.quantity} × {formatMoney(asset.unitCurrentPrice, asset.currentCurrency)}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{formatMoney(asset.purchasePrice, asset.purchaseCurrency)}</p>
            {asset.quantity && asset.unitPurchasePrice ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {asset.quantity} × {formatMoney(asset.unitPurchasePrice, asset.purchaseCurrency)}
              </p>
            ) : null}
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

      <Tabs defaultValue="overview" orientation="vertical">
        <TabsList className="w-48 shrink-0 gap-1">
          <TabsTrigger
            value="overview"
            className="h-12 py-3 data-active:bg-secondary data-active:text-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="valuation"
            className="h-12 py-3 data-active:bg-secondary data-active:text-foreground"
          >
            Valuation
          </TabsTrigger>
          <TabsTrigger
            value="attachments"
            className="h-12 py-3 data-active:bg-secondary data-active:text-foreground"
          >
            Attachments
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="h-12 py-3 data-active:bg-secondary data-active:text-foreground"
          >
            Activity
          </TabsTrigger>
          <TabsTrigger
            value="children"
            className="h-12 py-3 data-active:bg-secondary data-active:text-foreground"
          >
            Sub-assets
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-3">
          {asset.code ? <DetailRow label="Code" value={asset.code} /> : null}
          {asset.location ? <DetailRow label="Location" value={asset.location} /> : null}
          {fields.length > 0 ? (
            <div className="border border-border p-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                Custom fields
              </p>
              <dl className="grid gap-2 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.id} className="text-sm">
                    <dt className="text-xs text-muted-foreground">{f.label}</dt>
                    <dd className="mt-0.5">{formatFieldValue(asset.customFields[f.key])}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
          {asset.notes ? (
            <div className="border border-border p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{asset.notes}</p>
            </div>
          ) : null}
        </TabsContent>
        <TabsContent value="valuation">
          <ValuationTab
            asset={asset}
            defaultCurrency={workspace?.displayCurrency ?? asset.currentCurrency ?? 'IDR'}
            displayCurrency={workspace?.displayCurrency}
          />
        </TabsContent>
        <TabsContent value="attachments">
          <AttachmentTab assetId={asset.id} workspaceId={asset.workspaceId} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityFeed workspaceId={asset.workspaceId} assetId={asset.id} />
        </TabsContent>
        <TabsContent value="children">
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

function formatFieldValue(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length === 0 ? '—' : value.join(', ');
  return String(value);
}
