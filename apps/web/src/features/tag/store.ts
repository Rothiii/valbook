'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';

import type { Tag } from './types';

type TagState = {
  tags: Tag[];
  assetTags: Record<string, string[]>; // assetId -> tagId[]
};

type TagActions = {
  createTag: (input: {
    workspaceId: string;
    name: string;
    color?: string;
    actorId: string;
    actorName: string;
  }) => Tag;
  deleteTag: (input: { id: string; actorId: string; actorName: string }) => void;
  assignTags: (input: {
    assetId: string;
    tagIds: string[];
    workspaceId: string;
    actorId: string;
    actorName: string;
  }) => void;
  reset: () => void;
};

function uuid(): string {
  return crypto.randomUUID();
}

export const useTagStore = create<TagState & TagActions>()(
  persist(
    (set, get) => ({
      tags: [],
      assetTags: {},

      createTag: ({ workspaceId, name, color, actorId, actorName }) => {
        if (get().tags.some((t) => t.workspaceId === workspaceId && t.name === name)) {
          throw new Error(`Tag "${name}" already exists`);
        }
        const tag: Tag = {
          id: uuid(),
          workspaceId,
          name,
          color,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tags: [...state.tags, tag] }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'tag',
          entityId: tag.id,
          entityLabel: name,
          action: 'create',
        });
        return tag;
      },

      deleteTag: ({ id, actorId, actorName }) => {
        const before = get().tags.find((t) => t.id === id);
        if (!before) return;
        set((state) => {
          const nextAssetTags: Record<string, string[]> = {};
          for (const [assetId, tagIds] of Object.entries(state.assetTags)) {
            const filtered = tagIds.filter((tid) => tid !== id);
            if (filtered.length > 0) nextAssetTags[assetId] = filtered;
          }
          return {
            tags: state.tags.filter((t) => t.id !== id),
            assetTags: nextAssetTags,
          };
        });
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'tag',
          entityId: id,
          entityLabel: before.name,
          action: 'delete',
        });
      },

      assignTags: ({ assetId, tagIds, workspaceId, actorId, actorName }) => {
        set((state) => ({
          assetTags: {
            ...state.assetTags,
            [assetId]: tagIds,
          },
        }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'tag',
          entityId: assetId,
          action: 'update',
          diff: { tagIds },
        });
      },

      reset: () => set({ tags: [], assetTags: {} }),
    }),
    { name: 'valbook-tag', version: 1 },
  ),
);
