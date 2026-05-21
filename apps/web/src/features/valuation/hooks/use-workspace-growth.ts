'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useAssetStore } from '@/src/features/asset/store';
import { useConvert } from '@/src/features/currency/hooks/use-currency';

import { useValuationStore } from '../store';
import type { ValuationEntry } from '../types';

const EMPTY: ValuationEntry[] = [];

export type WorkspaceGrowth = {
  current: number;
  past: number;
  delta: number;
  percent: number | null;
  hasBaseline: boolean;
};

export function useWorkspaceGrowth(
  workspaceId: string | null | undefined,
  displayCurrency: string,
  daysAgo: number,
): WorkspaceGrowth {
  const entries = useValuationStore(
    useShallow((s) =>
      workspaceId ? s.entries.filter((e) => e.workspaceId === workspaceId) : EMPTY,
    ),
  );
  const assetIds = useAssetStore(
    useShallow((s) =>
      workspaceId
        ? s.assets.filter((a) => a.workspaceId === workspaceId && !a.archivedAt).map((a) => a.id)
        : [],
    ),
  );
  const convert = useConvert();

  return useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysAgo);
    const cutoffTime = cutoff.getTime();

    let current = 0;
    let past = 0;
    let hasBaseline = false;

    for (const assetId of assetIds) {
      const scoped = entries
        .filter((e) => e.assetId === assetId)
        .sort((a, b) => new Date(b.valuedAt).getTime() - new Date(a.valuedAt).getTime());
      const latest = scoped[0];
      if (latest) {
        const converted = convert(
          Number.parseFloat(latest.value),
          latest.currency,
          displayCurrency,
        );
        if (converted !== null) current += converted;
      }
      const baseline = scoped.find((e) => new Date(e.valuedAt).getTime() <= cutoffTime);
      if (baseline) {
        const converted = convert(
          Number.parseFloat(baseline.value),
          baseline.currency,
          displayCurrency,
        );
        if (converted !== null) {
          past += converted;
          hasBaseline = true;
        }
      }
    }

    const delta = current - past;
    const percent = past > 0 ? (delta / past) * 100 : null;
    return { current, past, delta, percent, hasBaseline };
  }, [entries, assetIds, convert, displayCurrency, daysAgo]);
}
