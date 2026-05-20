'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/src/shared/ui/button';

import { useAuthActions } from '../hooks/use-auth-actions';

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuthActions();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await logout();
        router.push('/login');
      }}
    >
      Logout
    </Button>
  );
}
