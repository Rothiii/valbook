'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';

import { useAuthActions } from '../hooks/use-auth-actions';
import { useSession } from '../hooks/use-session';

export function EmailVerificationCard() {
  const { user } = useSession();
  const { sendVerifyEmail } = useAuthActions();
  const [pending, setPending] = useState(false);

  if (!user) return null;

  const verified = user.emailVerified;

  async function handleResend() {
    if (!user) return;
    setPending(true);
    try {
      await sendVerifyEmail(user.email);
      toast.success('Verification email sent. Check your inbox.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Email verification</CardTitle>
          {verified ? (
            <Badge variant="secondary">Verified</Badge>
          ) : (
            <Badge variant="destructive">Unverified</Badge>
          )}
        </div>
        <CardDescription>
          {verified
            ? 'Your email address has been verified.'
            : 'Verify your email to unlock all features and receive important notifications.'}
        </CardDescription>
      </CardHeader>
      {!verified && (
        <CardContent>
          <Button onClick={handleResend} disabled={pending}>
            {pending ? 'Sending…' : 'Send verification email'}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
