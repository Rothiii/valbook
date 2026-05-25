'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

import { useSession } from '@/src/features/auth/hooks/use-session';
import { notify } from '@/src/shared/lib/notify';
import { useWorkspaceBySlug } from '../hooks/use-workspaces';
import { useWorkspaceStore } from '../store';

export function WorkspaceGuard({ slug, children }: { slug: string; children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isPending } = useSession();
  const workspace = useWorkspaceBySlug(slug);
  const [hydrated, setHydrated] = useState(() => useWorkspaceStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    const unsub = useWorkspaceStore.persist.onFinishHydration(() => setHydrated(true));
    if (useWorkspaceStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);

  useEffect(() => {
    if (isPending || !hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=/app/w/${slug}`);
      return;
    }
    if (!workspace) {
      notify.error('Workspace not found or you no longer have access');
      router.replace('/app');
    }
  }, [hydrated, isPending, isAuthenticated, workspace, router, slug]);

  if (isPending || !hydrated) return null;
  if (!isAuthenticated || !workspace) return null;
  return <>{children}</>;
}
