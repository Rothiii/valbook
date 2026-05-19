import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthCard } from '@/src/shared/ui/auth-card';
import { Button } from '@/src/shared/ui/button';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';

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
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
