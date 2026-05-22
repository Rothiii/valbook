'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';

import type { CreateAssetInput, UpdateAssetInput } from './schema';
import type { Asset, AssetStatus } from './types';

type AssetState = {
  assets: Asset[];
};

type AssetActions = {
  createAsset: (input: CreateAssetInput & { actorId: string; actorName: string }) => Asset;
  updateAsset: (input: UpdateAssetInput & { actorId: string; actorName: string }) => void;
  archiveAsset: (input: { id: string; actorId: string; actorName: string }) => void;
  unarchiveAsset: (input: { id: string; actorId: string; actorName: string }) => void;
  deleteAsset: (input: { id: string; actorId: string; actorName: string }) => void;
  setParent: (input: {
    id: string;
    parentId: string | null;
    actorId: string;
    actorName: string;
  }) => void;
  reset: () => void;
};

function uuid(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useAssetStore = create<AssetState & AssetActions>()(
  persist(
    (set, get) => ({
      assets: [],

      createAsset: (input) => {
        const now = nowIso();
        const asset: Asset = {
          id: uuid(),
          workspaceId: input.workspaceId,
          parentAssetId: input.parentAssetId ?? null,
          categoryId: input.categoryId ?? null,
          ownerLabelId: input.ownerLabelId ?? null,
          name: input.name,
          code: input.code ?? null,
          status: input.status ?? 'active',
          location: input.location ?? null,
          notes: input.notes ?? null,
          quantity: input.quantity ?? null,
          unitPurchasePrice: input.unitPurchasePrice ?? null,
          unitCurrentPrice: input.unitCurrentPrice ?? null,
          purchasePrice: input.purchasePrice ?? null,
          purchaseCurrency: input.purchaseCurrency ?? null,
          purchaseDate: input.purchaseDate ?? null,
          currentValue: input.currentValue ?? input.purchasePrice ?? null,
          currentCurrency: input.currentCurrency ?? input.purchaseCurrency ?? null,
          currentValueUpdatedAt: input.currentValue ? now : null,
          customFields: input.customFields ?? {},
          archivedAt: null,
          createdBy: input.actorId,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ assets: [...state.assets, asset] }));
        useActivityStore.getState().writeActivity({
          workspaceId: input.workspaceId,
          actorId: input.actorId,
          actorName: input.actorName,
          entityType: 'asset',
          entityId: asset.id,
          entityLabel: asset.name,
          action: 'create',
          diff: { snapshot: asset },
        });
        return asset;
      },

      updateAsset: ({ id, actorId, actorName, ...patch }) => {
        const before = get().assets.find((a) => a.id === id);
        if (!before) return;
        const after: Asset = {
          ...before,
          ...patch,
          parentAssetId:
            patch.parentAssetId === undefined
              ? before.parentAssetId
              : (patch.parentAssetId ?? null),
          categoryId:
            patch.categoryId === undefined ? before.categoryId : (patch.categoryId ?? null),
          ownerLabelId:
            patch.ownerLabelId === undefined ? before.ownerLabelId : (patch.ownerLabelId ?? null),
          code: patch.code === undefined ? before.code : (patch.code ?? null),
          location: patch.location === undefined ? before.location : (patch.location ?? null),
          notes: patch.notes === undefined ? before.notes : (patch.notes ?? null),
          quantity: patch.quantity === undefined ? before.quantity : (patch.quantity ?? null),
          unitPurchasePrice:
            patch.unitPurchasePrice === undefined
              ? before.unitPurchasePrice
              : (patch.unitPurchasePrice ?? null),
          unitCurrentPrice:
            patch.unitCurrentPrice === undefined
              ? before.unitCurrentPrice
              : (patch.unitCurrentPrice ?? null),
          purchasePrice:
            patch.purchasePrice === undefined
              ? before.purchasePrice
              : (patch.purchasePrice ?? null),
          purchaseCurrency:
            patch.purchaseCurrency === undefined
              ? before.purchaseCurrency
              : (patch.purchaseCurrency ?? null),
          purchaseDate:
            patch.purchaseDate === undefined ? before.purchaseDate : (patch.purchaseDate ?? null),
          currentValue:
            patch.currentValue === undefined ? before.currentValue : (patch.currentValue ?? null),
          currentCurrency:
            patch.currentCurrency === undefined
              ? before.currentCurrency
              : (patch.currentCurrency ?? null),
          currentValueUpdatedAt:
            patch.currentValue !== undefined && patch.currentValue !== before.currentValue
              ? nowIso()
              : before.currentValueUpdatedAt,
          customFields: patch.customFields ?? before.customFields,
          updatedAt: nowIso(),
        };
        set((state) => ({ assets: state.assets.map((a) => (a.id === id ? after : a)) }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'asset',
          entityId: id,
          entityLabel: after.name,
          action: 'update',
          diff: { before, after },
        });
      },

      archiveAsset: ({ id, actorId, actorName }) => {
        const before = get().assets.find((a) => a.id === id);
        if (!before) return;
        const after: Asset = {
          ...before,
          status: 'archived' as AssetStatus,
          archivedAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((state) => ({ assets: state.assets.map((a) => (a.id === id ? after : a)) }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'asset',
          entityId: id,
          entityLabel: before.name,
          action: 'archive',
        });
      },

      unarchiveAsset: ({ id, actorId, actorName }) => {
        const before = get().assets.find((a) => a.id === id);
        if (!before) return;
        const after: Asset = {
          ...before,
          status: 'active' as AssetStatus,
          archivedAt: null,
          updatedAt: nowIso(),
        };
        set((state) => ({ assets: state.assets.map((a) => (a.id === id ? after : a)) }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'asset',
          entityId: id,
          entityLabel: before.name,
          action: 'unarchive',
        });
      },

      deleteAsset: ({ id, actorId, actorName }) => {
        const before = get().assets.find((a) => a.id === id);
        if (!before) return;
        set((state) => ({
          assets: state.assets
            .filter((a) => a.id !== id)
            .map((a) => (a.parentAssetId === id ? { ...a, parentAssetId: null } : a)),
        }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'asset',
          entityId: id,
          entityLabel: before.name,
          action: 'delete',
          diff: { before },
        });
      },

      setParent: ({ id, parentId, actorId, actorName }) => {
        const before = get().assets.find((a) => a.id === id);
        if (!before) return;
        if (parentId && wouldCreateCycle(get().assets, id, parentId)) {
          throw new Error('Cannot set parent: would create a cycle');
        }
        const after: Asset = { ...before, parentAssetId: parentId, updatedAt: nowIso() };
        set((state) => ({ assets: state.assets.map((a) => (a.id === id ? after : a)) }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'asset',
          entityId: id,
          entityLabel: before.name,
          action: 'reparent',
          diff: { before: before.parentAssetId, after: parentId },
        });
      },

      reset: () => set({ assets: [] }),
    }),
    {
      name: 'valbook-asset',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        if (version < 2 && persisted && typeof persisted === 'object' && 'assets' in persisted) {
          const state = persisted as { assets: Asset[] };
          state.assets = state.assets.map((a) => ({
            ...a,
            quantity: a.quantity ?? null,
            unitPurchasePrice: a.unitPurchasePrice ?? null,
            unitCurrentPrice: a.unitCurrentPrice ?? null,
          }));
          return state;
        }
        return persisted as never;
      },
    },
  ),
);

function wouldCreateCycle(assets: Asset[], assetId: string, newParentId: string): boolean {
  if (assetId === newParentId) return true;
  let current: string | null = newParentId;
  const visited = new Set<string>();
  while (current) {
    if (current === assetId) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    const parent = assets.find((a) => a.id === current);
    current = parent ? parent.parentAssetId : null;
  }
  return false;
}
