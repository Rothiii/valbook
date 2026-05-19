'use client';

import { useAuthStore } from '../store';

export function useSession() {
  const session = useAuthStore((s) => s.session);
  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
  };
}
