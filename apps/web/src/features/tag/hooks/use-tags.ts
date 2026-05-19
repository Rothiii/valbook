'use client';

import { useShallow } from 'zustand/react/shallow';

import { useTagStore } from '../store';
import type { Tag } from '../types';

const EMPTY_TAGS: Tag[] = [];
const EMPTY_IDS: string[] = [];

export function useTags(workspaceId: string | null | undefined) {
  return useTagStore(
    useShallow((s) =>
      workspaceId ? s.tags.filter((t) => t.workspaceId === workspaceId) : EMPTY_TAGS,
    ),
  );
}

export function useAssetTagIds(assetId: string | null | undefined) {
  return useTagStore(
    useShallow((s) => (assetId ? (s.assetTags[assetId] ?? EMPTY_IDS) : EMPTY_IDS)),
  );
}

export function useTagActions() {
  return useTagStore(
    useShallow((s) => ({
      createTag: s.createTag,
      deleteTag: s.deleteTag,
      assignTags: s.assignTags,
    })),
  );
}
