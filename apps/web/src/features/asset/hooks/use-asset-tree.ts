'use client';

import { useShallow } from 'zustand/react/shallow';

import { useAssetStore } from '../store';
import type { Asset } from '../types';

const EMPTY: Asset[] = [];

export function useAssetAncestors(asset: Asset | null | undefined) {
  return useAssetStore(
    useShallow((s) => {
      if (!asset) return EMPTY;
      const chain: Asset[] = [];
      let current: string | null = asset.parentAssetId;
      const visited = new Set<string>();
      while (current && !visited.has(current)) {
        visited.add(current);
        const parent = s.assets.find((a) => a.id === current);
        if (!parent) break;
        chain.unshift(parent);
        current = parent.parentAssetId;
      }
      return chain;
    }),
  );
}

export function useAssetCandidateParents(asset: Asset, workspaceId: string) {
  return useAssetStore(
    useShallow((s) => {
      const all = s.assets.filter((a) => a.workspaceId === workspaceId && a.id !== asset.id);
      // Exclude descendants of this asset to prevent cycles.
      const descendants = new Set<string>();
      const stack = [asset.id];
      while (stack.length > 0) {
        const id = stack.pop();
        if (!id) continue;
        for (const a of s.assets) {
          if (a.parentAssetId === id && !descendants.has(a.id)) {
            descendants.add(a.id);
            stack.push(a.id);
          }
        }
      }
      return all.filter((a) => !descendants.has(a.id));
    }),
  );
}
