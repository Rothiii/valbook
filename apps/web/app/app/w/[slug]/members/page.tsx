'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { InviteMemberDialog } from '@/src/features/workspace/components/invite-member-dialog';
import { useMembershipActions } from '@/src/features/workspace/hooks/use-workspace-actions';
import {
  useWorkspaceInvitations,
  useWorkspaceMembers,
} from '@/src/features/workspace/hooks/use-workspace-members';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import type { WorkspaceRole } from '@/src/features/workspace/types';
import { notify } from '@/src/shared/lib/notify';
import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { PageHeader } from '@/src/shared/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table';

export default function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const { user } = useSession();
  const members = useWorkspaceMembers(workspace.id);
  const invitations = useWorkspaceInvitations(workspace.id);
  const { updateMemberRole, removeMember, revokeInvitation, resendInvitation } =
    useMembershipActions();

  const pendingInvitations = invitations.filter((i) => !i.acceptedAt);

  function handleRoleChange(memberId: string, role: WorkspaceRole) {
    if (!user) return;
    try {
      updateMemberRole({ memberId, role, actorId: user.id, actorName: user.name });
      notify.success('Role updated');
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed');
    }
  }

  function handleRemove(memberId: string, name: string) {
    if (!user) return;
    if (!confirm(`Remove ${name}?`)) return;
    try {
      removeMember({ memberId, actorId: user.id, actorName: user.name });
      notify.success('Member removed');
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed');
    }
  }

  function handleRevoke(invitationId: string) {
    if (!user) return;
    revokeInvitation({ invitationId, actorId: user.id, actorName: user.name });
    notify.success('Invitation revoked');
  }

  function handleResend(invitationId: string) {
    const refreshed = resendInvitation({ invitationId });
    if (refreshed) {
      notify.success(`New link: /invite/${refreshed.token.slice(0, 12)}…`);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Members"
        description="People with access to this workspace."
        actions={<InviteMemberDialog workspaceId={workspace.id} />}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.userName}</TableCell>
              <TableCell className="text-muted-foreground">{m.userEmail}</TableCell>
              <TableCell>
                {m.role === 'owner' ? (
                  <Badge>{m.role}</Badge>
                ) : (
                  <Select
                    value={m.role}
                    onValueChange={(v) => handleRoleChange(m.id, v as WorkspaceRole)}
                  >
                    <SelectTrigger className="h-7 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">editor</SelectItem>
                      <SelectItem value="viewer">viewer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(m.joinedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {m.role === 'owner' ? (
                  <span className="text-xs text-muted-foreground">—</span>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(m.id, m.userName)}>
                    Remove
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-8">
        <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
          Pending invitations ({pendingInvitations.length})
        </h2>
        {pendingInvitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending invitations.</p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {pendingInvitations.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p>{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.role} · expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                  <code className="text-xs text-muted-foreground">
                    /invite/{inv.token.slice(0, 12)}…
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResend(inv.id)}>
                    Resend
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRevoke(inv.id)}>
                    Revoke
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
