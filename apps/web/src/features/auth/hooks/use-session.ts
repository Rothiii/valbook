'use client';

import { useBetterAuthSession } from '../auth-client';

export function useSession() {
  const { data, isPending } = useBetterAuthSession();
  const user = data?.user
    ? {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        emailVerified: data.user.emailVerified,
        avatarUrl: (data.user as unknown as { avatar_url?: string | null }).avatar_url ?? null,
      }
    : null;
  return {
    session: data ? { user, expiresAt: data.session.expiresAt.toString() } : null,
    user,
    isAuthenticated: !!data,
    isPending,
  };
}
