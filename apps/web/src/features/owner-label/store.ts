'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';

import type { CreateOwnerLabelInput, UpdateOwnerLabelInput } from './schema';
import type { OwnerLabel } from './types';

type OwnerLabelState = {
  owners: OwnerLabel[];
};

type OwnerLabelActions = {
  createOwnerLabel: (
    input: CreateOwnerLabelInput & { actorId: string; actorName: string },
  ) => OwnerLabel;
  updateOwnerLabel: (input: UpdateOwnerLabelInput & { actorId: string; actorName: string }) => void;
  deleteOwnerLabel: (input: { id: string; actorId: string; actorName: string }) => void;
  reset: () => void;
};

function uuid(): string {
  return crypto.randomUUID();
}

export const useOwnerLabelStore = create<OwnerLabelState & OwnerLabelActions>()(
  persist(
    (set, get) => ({
      owners: [],

      createOwnerLabel: ({ workspaceId, name, color, actorId, actorName }) => {
        const label: OwnerLabel = {
          id: uuid(),
          workspaceId,
          name,
          color,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ owners: [...state.owners, label] }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'owner_label',
          entityId: label.id,
          entityLabel: label.name,
          action: 'create',
          diff: { snapshot: label },
        });
        return label;
      },

      updateOwnerLabel: ({ id, name, color, actorId, actorName }) => {
        const before = get().owners.find((o) => o.id === id);
        if (!before) return;
        const after: OwnerLabel = {
          ...before,
          name: name ?? before.name,
          color: color ?? before.color,
        };
        set((state) => ({ owners: state.owners.map((o) => (o.id === id ? after : o)) }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'owner_label',
          entityId: id,
          entityLabel: after.name,
          action: 'update',
          diff: { before, after },
        });
      },

      deleteOwnerLabel: ({ id, actorId, actorName }) => {
        const before = get().owners.find((o) => o.id === id);
        if (!before) return;
        set((state) => ({ owners: state.owners.filter((o) => o.id !== id) }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'owner_label',
          entityId: id,
          entityLabel: before.name,
          action: 'delete',
          diff: { before },
        });
      },

      reset: () => set({ owners: [] }),
    }),
    { name: 'valbook-owner-label', version: 1 },
  ),
);
