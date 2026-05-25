'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { useSession } from '../hooks/use-session';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    if (!isAuthenticated) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${next}`);
    }
  }, [isPending, isAuthenticated, pathname, router]);

  if (isPending) return null;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
