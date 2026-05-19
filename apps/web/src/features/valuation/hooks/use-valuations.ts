'use client';

import { useShallow } from 'zustand/react/shallow';

import { useValuationStore } from '../store';
import type { ValuationEntry } from '../types';

const EMPTY: ValuationEntry[] = [];

export function useAssetValuations(assetId: string | null | undefined) {
  return useValuationStore(
    useShallow((s) => {
      if (!assetId) return EMPTY;
      return [...s.entries]
        .filter((e) => e.assetId === assetId)
        .sort((a, b) => new Date(b.valuedAt).getTime() - new Date(a.valuedAt).getTime());
    }),
  );
}

export function useValuationActions() {
  return useValuationStore(
    useShallow((s) => ({
      createValuation: s.createValuation,
      updateValuation: s.updateValuation,
      deleteValuation: s.deleteValuation,
      bulkImport: s.bulkImport,
    })),
  );
}
