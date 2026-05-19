'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useCategories } from '@/src/features/category/hooks/use-categories';
import { useOwnerLabels } from '@/src/features/owner-label/hooks/use-owner-labels';
import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { Input } from '@/src/shared/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table';

import { useAssets } from '../hooks/use-assets';

export type AssetTableProps = {
  workspaceId: string;
  workspaceSlug: string;
};

export function AssetTable({ workspaceId, workspaceSlug }: AssetTableProps) {
  const [search, setSearch] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const assets = useAssets(workspaceId, { search, includeArchived });
  const categories = useCategories(workspaceId);
  const owners = useOwnerLabels(workspaceId);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const ownerMap = new Map(owners.map((o) => [o.id, o]));

  return (
    <div className="space-y-4">
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
          {includeArchived ? 'Hide archived' : 'Include archived'}
        </Button>
      </div>

      {assets.length === 0 ? (
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((a) => (
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
                  <Badge variant={a.status === 'active' ? 'default' : 'secondary'}>
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {a.currentValue ? `${a.currentCurrency ?? ''} ${a.currentValue}` : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
