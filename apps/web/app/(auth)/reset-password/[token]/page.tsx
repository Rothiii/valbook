import type { Metadata } from 'next';
import Link from 'next/link';

import { ResetPasswordForm } from '@/src/features/auth/components/reset-password-form';
import { AuthCard } from '@/src/shared/ui/auth-card';

export const metadata: Metadata = { title: 'Reset password · Valbook' };

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <AuthCard
      title="Set new password"
      description="Choose a strong password."
      footer={
        <Link href="/login" className="text-foreground underline">
          Back to login
        </Link>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
