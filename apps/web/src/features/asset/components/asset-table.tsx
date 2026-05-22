'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useCategories } from '@/src/features/category/hooks/use-categories';
import { useOwnerLabels } from '@/src/features/owner-label/hooks/use-owner-labels';
import { useTagStore } from '@/src/features/tag/store';
import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { Input } from '@/src/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table';
import { formatMoney } from '@/src/shared/utils/format';

import { useAssets } from '../hooks/use-assets';
import type { AssetStatus } from '../types';

const STATUSES: AssetStatus[] = ['active', 'archived', 'sold', 'lost', 'disposed'];

export type AssetTableProps = {
  workspaceId: string;
  workspaceSlug: string;
};

export function AssetTable({ workspaceId, workspaceSlug }: AssetTableProps) {
  const [search, setSearch] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('__all');
  const [ownerId, setOwnerId] = useState<string>('__all');
  const [statusFilter, setStatusFilter] = useState<string>('__all');
  const [tagFilter, setTagFilter] = useState<string>('__all');
  const [valueMin, setValueMin] = useState('');
  const [valueMax, setValueMax] = useState('');

  const assets = useAssets(workspaceId, { search, includeArchived });
  const categories = useCategories(workspaceId);
  const owners = useOwnerLabels(workspaceId);
  const tagStoreSnapshot = useTagStore((s) => s.tags);
  const assetTagsMap = useTagStore((s) => s.assetTags);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const ownerMap = new Map(owners.map((o) => [o.id, o]));
  const tagMap = new Map(tagStoreSnapshot.map((t) => [t.id, t]));
  const workspaceTags = tagStoreSnapshot.filter((t) => t.workspaceId === workspaceId);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (categoryId !== '__all' && a.categoryId !== categoryId) return false;
      if (ownerId !== '__all' && a.ownerLabelId !== ownerId) return false;
      if (statusFilter !== '__all' && a.status !== statusFilter) return false;
      if (tagFilter !== '__all') {
        const ids = assetTagsMap[a.id] ?? [];
        if (!ids.includes(tagFilter)) return false;
      }
      if (valueMin) {
        const n = Number.parseFloat(a.currentValue ?? '0');
        if (Number.isNaN(n) || n < Number.parseFloat(valueMin)) return false;
      }
      if (valueMax) {
        const n = Number.parseFloat(a.currentValue ?? '0');
        if (Number.isNaN(n) || n > Number.parseFloat(valueMax)) return false;
      }
      return true;
    });
  }, [assets, categoryId, ownerId, statusFilter, tagFilter, valueMin, valueMax, assetTagsMap]);

  const activeFilters = [
    categoryId !== '__all' && 'category',
    ownerId !== '__all' && 'owner',
    statusFilter !== '__all' && 'status',
    tagFilter !== '__all' && 'tag',
    valueMin && 'min',
    valueMax && 'max',
    includeArchived && 'archived',
  ].filter(Boolean);

  function clearFilters() {
    setCategoryId('__all');
    setOwnerId('__all');
    setStatusFilter('__all');
    setTagFilter('__all');
    setValueMin('');
    setValueMax('');
    setIncludeArchived(false);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or code…"
            className="w-64"
          />
          <Button
            variant={includeArchived ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setIncludeArchived((v) => !v)}
          >
            {includeArchived ? '✓ Archived' : '+ Archived'}
          </Button>
          {activeFilters.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ownerId} onValueChange={setOwnerId}>
            <SelectTrigger>
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All owners</SelectItem>
              {owners.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All tags</SelectItem>
              {workspaceTags.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Min value"
            value={valueMin}
            onChange={(e) => setValueMin(e.target.value)}
            className="w-32"
          />
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Max value"
            value={valueMax}
            onChange={(e) => setValueMax(e.target.value)}
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {assets.length} shown
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No assets match"
          description="Try removing filters or add your first asset."
          action={
            <Button asChild>
              <Link href={`/app/w/${workspaceSlug}/assets/new`}>+ Add asset</Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => {
              const tagIds = assetTagsMap[a.id] ?? [];
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link href={`/app/w/${workspaceSlug}/assets/${a.id}`} className="underline">
                      {a.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.code ?? '—'}</TableCell>
                  <TableCell>
                    {a.categoryId ? (categoryMap.get(a.categoryId)?.name ?? '—') : '—'}
                  </TableCell>
                  <TableCell>
                    {a.ownerLabelId ? (ownerMap.get(a.ownerLabelId)?.name ?? '—') : '—'}
                  </TableCell>
                  <TableCell>
                    {tagIds.length === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {tagIds.slice(0, 3).map((tid) => {
                          const tag = tagMap.get(tid);
                          if (!tag) return null;
                          return (
                            <Badge
                              key={tid}
                              variant="secondary"
                              style={
                                tag.color ? { background: tag.color, color: '#fafafa' } : undefined
                              }
                            >
                              {tag.name}
                            </Badge>
                          );
                        })}
                        {tagIds.length > 3 ? (
                          <span className="text-xs text-muted-foreground">
                            +{tagIds.length - 3}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.status === 'active' ? 'default' : 'secondary'}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoney(a.currentValue, a.currentCurrency)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
