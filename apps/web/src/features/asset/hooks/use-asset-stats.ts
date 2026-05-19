'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useAssetStore } from '../store';
import type { Asset } from '../types';

export type AssetStats = {
  total: number;
  active: number;
  archived: number;
  totalValueByCurrency: Record<string, number>;
  byCategory: Map<string, number>;
  byOwner: Map<string, number>;
};

const EMPTY_ASSETS: Asset[] = [];

export function useAssetStats(workspaceId: string | null | undefined): AssetStats {
  const assets = useAssetStore(
    useShallow((s) =>
      workspaceId ? s.assets.filter((a) => a.workspaceId === workspaceId) : EMPTY_ASSETS,
    ),
  );

  return useMemo(() => {
    const stats: AssetStats = {
      total: assets.length,
      active: 0,
      archived: 0,
      totalValueByCurrency: {},
      byCategory: new Map(),
      byOwner: new Map(),
    };
    for (const asset of assets) {
      if (asset.archivedAt) {
        stats.archived += 1;
        continue;
      }
      stats.active += 1;
      if (asset.currentValue && asset.currentCurrency) {
        const n = Number.parseFloat(asset.currentValue);
        if (!Number.isNaN(n)) {
          stats.totalValueByCurrency[asset.currentCurrency] =
            (stats.totalValueByCurrency[asset.currentCurrency] ?? 0) + n;
        }
      }
      if (asset.categoryId) {
        stats.byCategory.set(asset.categoryId, (stats.byCategory.get(asset.categoryId) ?? 0) + 1);
      }
      if (asset.ownerLabelId) {
        stats.byOwner.set(asset.ownerLabelId, (stats.byOwner.get(asset.ownerLabelId) ?? 0) + 1);
      }
    }
    return stats;
  }, [assets]);
}
