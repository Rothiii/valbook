'use client';

import { useOwnerLabelStore } from '../store';

export function useOwnerLabels(workspaceId: string | null | undefined) {
  return useOwnerLabelStore((s) =>
    workspaceId ? s.owners.filter((o) => o.workspaceId === workspaceId) : [],
  );
}

export function useOwnerLabel(id: string | null | undefined) {
  return useOwnerLabelStore((s) => (id ? (s.owners.find((o) => o.id === id) ?? null) : null));
}

export function useOwnerLabelActions() {
  return useOwnerLabelStore((s) => ({
    createOwnerLabel: s.createOwnerLabel,
    updateOwnerLabel: s.updateOwnerLabel,
    deleteOwnerLabel: s.deleteOwnerLabel,
  }));
}
