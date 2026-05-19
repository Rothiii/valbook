'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';
import { useAssetStore } from '@/src/features/asset/store';

import type { CreateValuationInput, UpdateValuationInput } from './schema';
import type { ValuationEntry } from './types';

type ValuationState = {
  entries: ValuationEntry[];
};

type ValuationActions = {
  createValuation: (
    input: CreateValuationInput & {
      workspaceId: string;
      assetName: string;
      actorId: string;
      actorName: string;
    },
  ) => ValuationEntry;
  updateValuation: (input: UpdateValuationInput & { actorId: string; actorName: string }) => void;
  deleteValuation: (input: { id: string; actorId: string; actorName: string }) => void;
  bulkImport: (input: {
    workspaceId: string;
    rows: Array<Omit<ValuationEntry, 'id' | 'createdAt' | 'source'>>;
    actorId: string;
    actorName: string;
  }) => { insertedCount: number };
  reset: () => void;
};

function uuid(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

function recomputeCurrentValue(assetId: string, entries: ValuationEntry[]) {
  const scoped = entries
    .filter((e) => e.assetId === assetId)
    .sort((a, b) => new Date(b.valuedAt).getTime() - new Date(a.valuedAt).getTime());
  const latest = scoped[0] ?? null;
  const assets = useAssetStore.getState().assets;
  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return;
  useAssetStore.setState({
    assets: assets.map((a) =>
      a.id === assetId
        ? {
            ...a,
            currentValue: latest ? latest.value : a.purchasePrice,
            currentCurrency: latest ? latest.currency : a.purchaseCurrency,
            currentValueUpdatedAt: latest ? latest.valuedAt : a.currentValueUpdatedAt,
            updatedAt: nowIso(),
          }
        : a,
    ),
  });
}

export const useValuationStore = create<ValuationState & ValuationActions>()(
  persist(
    (set, get) => ({
      entries: [],

      createValuation: ({
        assetId,
        value,
        currency,
        valuedAt,
        note,
        source,
        workspaceId,
        assetName,
        actorId,
        actorName,
      }) => {
        const entry: ValuationEntry = {
          id: uuid(),
          assetId,
          workspaceId,
          value,
          currency,
          valuedAt,
          source: source ?? 'manual',
          note: note ?? null,
          customFields: {},
          createdBy: actorId,
          createdAt: nowIso(),
        };
        set((state) => ({ entries: [...state.entries, entry] }));
        recomputeCurrentValue(assetId, get().entries);
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'valuation',
          entityId: entry.id,
          entityLabel: assetName,
          action: 'create',
          diff: { snapshot: entry },
        });
        return entry;
      },

      updateValuation: ({ id, value, currency, valuedAt, note, actorId, actorName }) => {
        const before = get().entries.find((e) => e.id === id);
        if (!before) return;
        const after: ValuationEntry = {
          ...before,
          value: value ?? before.value,
          currency: currency ?? before.currency,
          valuedAt: valuedAt ?? before.valuedAt,
          note: note === undefined ? before.note : note,
        };
        set((state) => ({ entries: state.entries.map((e) => (e.id === id ? after : e)) }));
        recomputeCurrentValue(before.assetId, get().entries);
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'valuation',
          entityId: id,
          action: 'update',
          diff: { before, after },
        });
      },

      deleteValuation: ({ id, actorId, actorName }) => {
        const before = get().entries.find((e) => e.id === id);
        if (!before) return;
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
        recomputeCurrentValue(before.assetId, get().entries);
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'valuation',
          entityId: id,
          action: 'delete',
          diff: { before },
        });
      },

      bulkImport: ({ workspaceId, rows, actorId, actorName }) => {
        const now = nowIso();
        const newEntries: ValuationEntry[] = rows.map((row) => ({
          id: uuid(),
          assetId: row.assetId,
          workspaceId,
          value: row.value,
          currency: row.currency,
          valuedAt: row.valuedAt,
          note: row.note,
          source: 'import',
          customFields: {},
          createdBy: actorId,
          createdAt: now,
        }));
        set((state) => ({ entries: [...state.entries, ...newEntries] }));
        const affected = new Set(newEntries.map((e) => e.assetId));
        for (const aId of affected) {
          recomputeCurrentValue(aId, get().entries);
        }
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'valuation',
          entityId: 'bulk',
          entityLabel: `${newEntries.length} valuation entries`,
          action: 'bulk_import',
          diff: { insertedCount: newEntries.length },
        });
        return { insertedCount: newEntries.length };
      },

      reset: () => set({ entries: [] }),
    }),
    { name: 'valbook-valuation', version: 1 },
  ),
);
