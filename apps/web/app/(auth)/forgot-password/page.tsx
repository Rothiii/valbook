import type { Metadata } from 'next';
import Link from 'next/link';

import { ForgotPasswordForm } from '@/src/features/auth/components/forgot-password-form';
import { AuthCard } from '@/src/shared/ui/auth-card';

export const metadata: Metadata = { title: 'Forgot password · Valbook' };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email. We'll send a reset link."
      footer={
        <Link href="/login" className="text-foreground underline">
          Back to login
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
