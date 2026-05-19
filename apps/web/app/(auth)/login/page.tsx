import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthCard } from '@/src/shared/ui/auth-card';
import { Button } from '@/src/shared/ui/button';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';

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
        </span>
      }
    >
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground underline">
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </AuthCard>
  );
}
