'use client';

import { useShallow } from 'zustand/react/shallow';

import { useWorkspaceStore } from '../store';

export function useWorkspaceActions() {
  return useWorkspaceStore(
    useShallow((s) => ({
      createWorkspace: s.createWorkspace,
      updateWorkspace: s.updateWorkspace,
      deleteWorkspace: s.deleteWorkspace,
      setCurrentSlug: s.setCurrentSlug,
    })),
  );
}

export function useMembershipActions() {
  return useWorkspaceStore(
    useShallow((s) => ({
      inviteMember: s.inviteMember,
      revokeInvitation: s.revokeInvitation,
      resendInvitation: s.resendInvitation,
      acceptInvitation: s.acceptInvitation,
      updateMemberRole: s.updateMemberRole,
      removeMember: s.removeMember,
      leaveWorkspace: s.leaveWorkspace,
    })),
  );
}
