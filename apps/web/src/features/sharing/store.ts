'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';

import type { PublicShare, ShareScope } from './types';

type ShareState = {
  shares: PublicShare[];
};

type ShareActions = {
  createShare: (input: {
    workspaceId: string;
    scope: ShareScope;
    targetId: string;
    expiresAt: string | null;
    actorId: string;
    actorName: string;
    targetLabel?: string;
  }) => PublicShare;
  updateExpiry: (input: {
    id: string;
    expiresAt: string | null;
    actorId: string;
    actorName: string;
  }) => void;
  revokeShare: (input: { id: string; actorId: string; actorName: string }) => void;
  reset: () => void;
};

function uuid(): string {
  return crypto.randomUUID();
}

function token(): string {
  return `${uuid().replace(/-/g, '')}${uuid().replace(/-/g, '')}`.slice(0, 48);
}

export const useShareStore = create<ShareState & ShareActions>()(
  persist(
    (set, get) => ({
      shares: [],

      createShare: ({
        workspaceId,
        scope,
        targetId,
        expiresAt,
        actorId,
        actorName,
        targetLabel,
      }) => {
        const share: PublicShare = {
          id: uuid(),
          workspaceId,
          scope,
          targetId,
          token: token(),
          permission: 'view',
          expiresAt,
          createdBy: actorId,
          createdAt: new Date().toISOString(),
          revokedAt: null,
        };
        set((state) => ({ shares: [...state.shares, share] }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'share',
          entityId: share.id,
          entityLabel: `${scope} · ${targetLabel ?? targetId}`,
          action: 'create',
          diff: { snapshot: share },
        });
        return share;
      },

      updateExpiry: ({ id, expiresAt, actorId, actorName }) => {
        const before = get().shares.find((s) => s.id === id);
        if (!before) return;
        set((state) => ({
          shares: state.shares.map((s) => (s.id === id ? { ...s, expiresAt } : s)),
        }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'share',
          entityId: id,
          action: 'update',
          diff: { before: before.expiresAt, after: expiresAt },
        });
      },

      revokeShare: ({ id, actorId, actorName }) => {
        const before = get().shares.find((s) => s.id === id);
        if (!before) return;
        const now = new Date().toISOString();
        set((state) => ({
          shares: state.shares.map((s) => (s.id === id ? { ...s, revokedAt: now } : s)),
        }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'share',
          entityId: id,
          action: 'revoke',
        });
      },

      reset: () => set({ shares: [] }),
    }),
    { name: 'valbook-share', version: 1 },
  ),
);
