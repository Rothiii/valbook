'use client';

import { useWorkspaceStore } from '../store';

export function useWorkspaceMembers(workspaceId: string | null | undefined) {
  return useWorkspaceStore((s) => (workspaceId ? (s.members[workspaceId] ?? []) : []));
}

export function useWorkspaceInvitations(workspaceId: string | null | undefined) {
  return useWorkspaceStore((s) => (workspaceId ? (s.invitations[workspaceId] ?? []) : []));
}
