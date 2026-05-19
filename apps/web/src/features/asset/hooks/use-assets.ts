'use client';

import { useAssetStore } from '../store';
import type { AssetStatus } from '../types';

export type AssetFilter = {
  search?: string;
  categoryIds?: string[];
  ownerLabelIds?: string[];
  statuses?: AssetStatus[];
  includeArchived?: boolean;
};

export function useAssets(workspaceId: string | null | undefined, filter: AssetFilter = {}) {
  return useAssetStore((s) => {
    if (!workspaceId) return [];
    const search = filter.search?.toLowerCase().trim();
    return s.assets
      .filter((a) => a.workspaceId === workspaceId)
      .filter((a) => filter.includeArchived || a.archivedAt === null)
      .filter((a) =>
        filter.categoryIds?.length ? filter.categoryIds.includes(a.categoryId ?? '') : true,
      )
      .filter((a) =>
        filter.ownerLabelIds?.length ? filter.ownerLabelIds.includes(a.ownerLabelId ?? '') : true,
      )
      .filter((a) => (filter.statuses?.length ? filter.statuses.includes(a.status) : true))
      .filter((a) => {
        if (!search) return true;
        return (
          a.name.toLowerCase().includes(search) || (a.code?.toLowerCase().includes(search) ?? false)
        );
      });
  });
}

export function useAsset(id: string | null | undefined) {
  return useAssetStore((s) => (id ? (s.assets.find((a) => a.id === id) ?? null) : null));
}

export function useAssetActions() {
  return useAssetStore((s) => ({
    createAsset: s.createAsset,
    updateAsset: s.updateAsset,
    archiveAsset: s.archiveAsset,
    unarchiveAsset: s.unarchiveAsset,
    deleteAsset: s.deleteAsset,
    setParent: s.setParent,
  }));
}

export function useAssetChildren(parentId: string | null | undefined) {
  return useAssetStore((s) =>
    parentId ? s.assets.filter((a) => a.parentAssetId === parentId) : [],
  );
}
