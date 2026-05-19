'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { useWorkspaceMembers } from '@/src/features/workspace/hooks/use-workspace-members';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { PageHeader } from '@/src/shared/ui/page-header';
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

  const members = useWorkspaceMembers(workspace.id);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Members"
        description="People with access to this workspace."
        actions={
          <Button disabled title="Invite flow lands in Phase 2">
            + Invite
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.userName}</TableCell>
              <TableCell className="text-muted-foreground">{m.userEmail}</TableCell>
              <TableCell>
                <Badge variant={m.role === 'owner' ? 'default' : 'secondary'}>{m.role}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(m.joinedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-8">
        <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
          Pending invitations
        </h2>
        <p className="text-sm text-muted-foreground">
          Invitation flow lands in Phase 2 along with the member management UI.
        </p>
      </div>
    </div>
  );
}
