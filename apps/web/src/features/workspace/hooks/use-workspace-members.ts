'use client';

import { useShallow } from 'zustand/react/shallow';

import { useWorkspaceStore } from '../store';
import type { WorkspaceInvitation, WorkspaceMember } from '../types';

const EMPTY_MEMBERS: WorkspaceMember[] = [];
const EMPTY_INVITATIONS: WorkspaceInvitation[] = [];

export function useWorkspaceMembers(workspaceId: string | null | undefined) {
  return useWorkspaceStore(
    useShallow((s) => (workspaceId ? (s.members[workspaceId] ?? EMPTY_MEMBERS) : EMPTY_MEMBERS)),
  );
}

export function useWorkspaceInvitations(workspaceId: string | null | undefined) {
  return useWorkspaceStore(
    useShallow((s) =>
      workspaceId ? (s.invitations[workspaceId] ?? EMPTY_INVITATIONS) : EMPTY_INVITATIONS,
    ),
  );
}
