'use client';

import { useAssetStore } from '../store';

export type AssetStats = {
  total: number;
  active: number;
  archived: number;
  totalValueByCurrency: Record<string, number>;
  byCategory: Map<string, number>;
  byOwner: Map<string, number>;
};

export function useAssetStats(workspaceId: string | null | undefined): AssetStats {
  return useAssetStore((s) => {
    const empty: AssetStats = {
      total: 0,
      active: 0,
      archived: 0,
      totalValueByCurrency: {},
      byCategory: new Map(),
      byOwner: new Map(),
    };
    if (!workspaceId) return empty;
    const scoped = s.assets.filter((a) => a.workspaceId === workspaceId);
    const stats: AssetStats = {
      total: scoped.length,
      active: 0,
      archived: 0,
      totalValueByCurrency: {},
      byCategory: new Map(),
      byOwner: new Map(),
    };
    for (const asset of scoped) {
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
  });
}
