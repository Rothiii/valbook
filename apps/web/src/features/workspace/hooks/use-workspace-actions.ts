'use client';

import { useWorkspaceStore } from '../store';

export function useWorkspaceActions() {
  return useWorkspaceStore((s) => ({
    createWorkspace: s.createWorkspace,
    updateWorkspace: s.updateWorkspace,
    deleteWorkspace: s.deleteWorkspace,
    setCurrentSlug: s.setCurrentSlug,
  }));
}
