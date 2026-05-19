'use client';

import { useWorkspaceStore } from '../store';

export function useWorkspaces() {
  return useWorkspaceStore((s) => s.workspaces);
}

export function useWorkspaceBySlug(slug: string) {
  return useWorkspaceStore((s) => s.workspaces.find((w) => w.slug === slug) ?? null);
}

export function useCurrentSlug() {
  return useWorkspaceStore((s) => s.currentSlug);
}
