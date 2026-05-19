import type { Metadata } from 'next';
import Link from 'next/link';

import { VerifyEmailAction } from '@/src/features/auth/components/verify-email-action';
import { AuthCard } from '@/src/shared/ui/auth-card';

export const metadata: Metadata = { title: 'Verify email · Valbook' };

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthCard
      title="Verify email"
      description="Confirming your email…"
      footer={
        <Link href="/login" className="text-foreground underline">
          Back to login
        </Link>
      }
    >
      <VerifyEmailAction token={token} />
    </AuthCard>
  );
}
