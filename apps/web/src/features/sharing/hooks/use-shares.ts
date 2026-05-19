'use client';

import { useShallow } from 'zustand/react/shallow';

import { useShareStore } from '../store';
import type { PublicShare } from '../types';

const EMPTY: PublicShare[] = [];

export function useWorkspaceShares(workspaceId: string | null | undefined) {
  return useShareStore(
    useShallow((s) =>
      workspaceId ? s.shares.filter((sh) => sh.workspaceId === workspaceId) : EMPTY,
    ),
  );
}

export function useShareByToken(token: string) {
  return useShareStore(useShallow((s) => s.shares.find((sh) => sh.token === token) ?? null));
}

export function useShareActions() {
  return useShareStore(
    useShallow((s) => ({
      createShare: s.createShare,
      updateExpiry: s.updateExpiry,
      revokeShare: s.revokeShare,
    })),
  );
}
