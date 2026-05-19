import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthCard } from '@/src/shared/ui/auth-card';
import { Button } from '@/src/shared/ui/button';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';

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
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
        </div>
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
