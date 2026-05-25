'use client';

import { useShallow } from 'zustand/react/shallow';

import { useSession } from '@/src/features/auth/hooks/use-session';

import { useWorkspaceStore } from '../store';
import type { WorkspaceRole } from '../types';

export function useWorkspaces() {
  const { user } = useSession();
  const userId = user?.id ?? null;
  return useWorkspaceStore(
    useShallow((s) => {
      if (!userId) return [];
      return s.workspaces.filter((w) => (s.members[w.id] ?? []).some((m) => m.userId === userId));
    }),
  );
}

export function useWorkspaceBySlug(slug: string) {
  const { user } = useSession();
  const userId = user?.id ?? null;
  return useWorkspaceStore(
    useShallow((s) => {
      if (!userId) return null;
      const ws = s.workspaces.find((w) => w.slug === slug);
      if (!ws) return null;
      const isMember = (s.members[ws.id] ?? []).some((m) => m.userId === userId);
      return isMember ? ws : null;
    }),
  );
}

export function useCurrentSlug() {
  return useWorkspaceStore((s) => s.currentSlug);
}

export type CurrentMembership =
  | {
      role: WorkspaceRole;
      isMember: true;
    }
  | {
      role: null;
      isMember: false;
    };

export function useCurrentMembership(workspaceId: string | null | undefined): CurrentMembership {
  const { user } = useSession();
  const userId = user?.id ?? null;
  return useWorkspaceStore(
    useShallow((s) => {
      if (!userId || !workspaceId) return { role: null, isMember: false } as const;
      const member = (s.members[workspaceId] ?? []).find((m) => m.userId === userId);
      if (!member) return { role: null, isMember: false } as const;
      return { role: member.role, isMember: true } as const;
    }),
  );
}
