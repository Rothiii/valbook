'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/src/shared/ui/button';

import { useAuthActions } from '../hooks/use-auth-actions';

export type VerifyEmailActionProps = {
  token: string;
};

export function VerifyEmailAction({ token }: VerifyEmailActionProps) {
  const router = useRouter();
  const { verifyEmail } = useAuthActions();
  const [status, setStatus] = useState<'pending' | 'verified' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await verifyEmail(token);
        setStatus('verified');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    })();
  }, [token, verifyEmail]);

  if (status === 'pending') {
    return <p className="text-sm text-muted-foreground">Verifying…</p>;
  }

  if (status === 'error') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{errorMessage}</p>
        <Button asChild className="w-full">
          <a href="/login">Back to login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Email verified. You can log in now.</p>
      <Button
        className="w-full"
        onClick={() => {
          toast.success('Email verified');
          router.push('/login');
        }}
      >
        Go to login
      </Button>
    </div>
  );
}
