import type { Metadata } from 'next';
import Link from 'next/link';

import { InvitationAccept } from '@/src/features/workspace/components/invitation-accept';
import { AuthCard } from '@/src/shared/ui/auth-card';

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
      <InvitationAccept token={token} />
    </AuthCard>
  );
}
