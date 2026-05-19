import type { Metadata } from 'next';
import Link from 'next/link';

import { RegisterForm } from '@/src/features/auth/components/register-form';
import { AuthCard } from '@/src/shared/ui/auth-card';

export const metadata: Metadata = { title: 'Register · Valbook' };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      description="Get started with Valbook."
      footer={
        <span>
          Already have an account?{' '}
          <Link href="/login" className="text-foreground underline">
            Login
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
