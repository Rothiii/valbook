'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useSession } from '@/src/features/auth/hooks/use-session';
import { Button } from '@/src/shared/ui/button';

import { useMembershipActions } from '../hooks/use-workspace-actions';
import { useWorkspaceStore } from '../store';

export function InvitationAccept({ token }: { token: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useSession();
  const { acceptInvitation } = useMembershipActions();
  const [pending, setPending] = useState(false);

  const { invitation, workspace } = useWorkspaceStore((s) => {
    const inv = Object.values(s.invitations)
      .flat()
      .find((i) => i.token === token);
    const ws = inv ? (s.workspaces.find((w) => w.id === inv.workspaceId) ?? null) : null;
    return { invitation: inv ?? null, workspace: ws };
  });

  const status = useMemo(() => {
    if (!invitation) return 'invalid' as const;
    if (invitation.acceptedAt) return 'already' as const;
    if (new Date(invitation.expiresAt).getTime() < Date.now()) return 'expired' as const;
    return 'ok' as const;
  }, [invitation]);

  if (status === 'invalid') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">Invitation not found.</p>
        <Button asChild className="w-full">
          <Link href="/app">Back to workspaces</Link>
        </Button>
      </div>
    );
  }
  if (status === 'already') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">This invitation has already been accepted.</p>
        <Button asChild className="w-full">
          <Link href="/app">Back to workspaces</Link>
        </Button>
      </div>
    );
  }
  if (status === 'expired') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">Invitation expired.</p>
        <Button asChild className="w-full">
          <Link href="/app">Back to workspaces</Link>
        </Button>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-4">
        <div className="border border-border bg-muted/50 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
          <p className="mt-1 text-sm">{workspace?.name}</p>
          <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Role</p>
          <p className="mt-1 text-sm">{invitation?.role}</p>
          <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Invitee</p>
          <p className="mt-1 text-sm">{invitation?.email}</p>
        </div>
        <Button asChild className="w-full">
          <Link href={`/login?next=/invite/${token}`}>Login to accept</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href={`/register?next=/invite/${token}`}>Or create account</Link>
        </Button>
      </div>
    );
  }

  function handleAccept() {
    if (!user || !invitation) return;
    setPending(true);
    try {
      const { workspaceSlug } = acceptInvitation({
        token,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      });
      toast.success('Joined workspace');
      router.push(`/app/w/${workspaceSlug}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed');
    } finally {
      setPending(false);
    }
  }

  const emailMismatch = user.email.toLowerCase() !== invitation?.email.toLowerCase();

  return (
    <div className="space-y-4">
      <div className="border border-border bg-muted/50 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
        <p className="mt-1 text-sm">{workspace?.name}</p>
        <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Role</p>
        <p className="mt-1 text-sm">{invitation?.role}</p>
        <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Invited email</p>
        <p className="mt-1 text-sm">{invitation?.email}</p>
      </div>
      {emailMismatch ? (
        <p className="text-sm text-destructive">
          This invitation was sent to <strong>{invitation?.email}</strong>. Sign in with that email
          to accept.
        </p>
      ) : null}
      <Button className="w-full" onClick={handleAccept} disabled={pending || emailMismatch}>
        {pending ? 'Joining…' : 'Accept invitation'}
      </Button>
      <Button asChild variant="ghost" className="w-full">
        <Link href="/app">Decline</Link>
      </Button>
    </div>
  );
}
