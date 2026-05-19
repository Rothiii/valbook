'use client';

import { useEffect } from 'react';

import { WorkspaceSwitcher } from '@/src/shared/ui/workspace-switcher';

import { useWorkspaceActions } from '../hooks/use-workspace-actions';
import { useWorkspaces } from '../hooks/use-workspaces';

export type WorkspaceSwitcherLiveProps = {
  currentSlug: string;
};

export function WorkspaceSwitcherLive({ currentSlug }: WorkspaceSwitcherLiveProps) {
  const workspaces = useWorkspaces();
  const { setCurrentSlug } = useWorkspaceActions();
  const current = workspaces.find((w) => w.slug === currentSlug);

  useEffect(() => {
    if (current) setCurrentSlug(current.slug);
  }, [current, setCurrentSlug]);

  return (
    <WorkspaceSwitcher
      current={current ? { slug: current.slug, name: current.name } : undefined}
      workspaces={workspaces.map((w) => ({ slug: w.slug, name: w.name }))}
    />
  );
}
