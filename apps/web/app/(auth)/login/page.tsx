import type { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from '@/src/features/auth/components/login-form';
import { AuthCard } from '@/src/shared/ui/auth-card';

export const metadata: Metadata = { title: 'Login · Valbook' };

export default function LoginPage() {
  return (
    <AuthCard
      title="Login"
      description="Welcome back."
      footer={
        <span>
          New here?{' '}
          <Link href="/register" className="text-foreground underline">
            Create an account
          </Link>
          {' · '}
          <Link href="/forgot-password" className="text-foreground underline">
            Forgot password
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
