'use client';

import { useShallow } from 'zustand/react/shallow';

import { useAssetStore } from '../store';
import type { Asset, AssetStatus } from '../types';

export type AssetFilter = {
  search?: string;
  categoryIds?: string[];
  ownerLabelIds?: string[];
  statuses?: AssetStatus[];
  includeArchived?: boolean;
};

const EMPTY_ASSETS: Asset[] = [];

export function useAssets(workspaceId: string | null | undefined, filter: AssetFilter = {}) {
  return useAssetStore(
    useShallow((s) => {
      if (!workspaceId) return EMPTY_ASSETS;
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
            a.name.toLowerCase().includes(search) ||
            (a.code?.toLowerCase().includes(search) ?? false)
          );
        });
    }),
  );
}

export function useAsset(id: string | null | undefined) {
  return useAssetStore((s) => (id ? (s.assets.find((a) => a.id === id) ?? null) : null));
}

export function useAssetActions() {
  return useAssetStore(
    useShallow((s) => ({
      createAsset: s.createAsset,
      updateAsset: s.updateAsset,
      archiveAsset: s.archiveAsset,
      unarchiveAsset: s.unarchiveAsset,
      deleteAsset: s.deleteAsset,
      setParent: s.setParent,
    })),
  );
}

export function useAssetChildren(parentId: string | null | undefined) {
  return useAssetStore(
    useShallow((s) =>
      parentId ? s.assets.filter((a) => a.parentAssetId === parentId) : EMPTY_ASSETS,
    ),
  );
}
