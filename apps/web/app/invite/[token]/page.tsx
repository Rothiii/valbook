import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthCard } from '@/src/shared/ui/auth-card';
import { Button } from '@/src/shared/ui/button';

export const metadata: Metadata = { title: 'Accept invitation · Valbook' };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthCard
      title="You're invited"
      description="Join a Valbook workspace."
      footer={
        <Link href="/login" className="text-foreground underline">
          Use different account
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="border border-border bg-muted/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
          <p className="mt-1 text-sm">Family Asset</p>
          <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Invited by</p>
          <p className="mt-1 text-sm">Rafid · Editor role</p>
        </div>
        <p className="text-xs text-muted-foreground">Token: {token.slice(0, 16)}...</p>
        <Button className="w-full">Accept invitation</Button>
        <Button variant="ghost" className="w-full">
          Decline
        </Button>
      </div>
    </AuthCard>
  );
}
