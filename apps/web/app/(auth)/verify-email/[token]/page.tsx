import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthCard } from '@/src/shared/ui/auth-card';
import { Button } from '@/src/shared/ui/button';

export const metadata: Metadata = { title: 'Verify email · Valbook' };

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthCard
      title="Verify email"
      description="Confirming your email..."
      footer={
        <Link href="/login" className="text-foreground underline">
          Back to login
        </Link>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Token: <code className="bg-muted px-1 text-xs">{token.slice(0, 16)}...</code>
        </p>
        <p className="text-sm text-muted-foreground">
          This page will auto-verify and redirect once the email is confirmed.
        </p>
        <Button asChild className="w-full">
          <Link href="/onboarding">Continue</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
