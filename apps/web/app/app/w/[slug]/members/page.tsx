import type { Metadata } from 'next';

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

export const metadata: Metadata = { title: 'Members · Valbook' };

const MOCK_MEMBERS = [{ id: 'me', name: 'Rafid', email: 'me@example.com', role: 'owner' as const }];

export default function MembersPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Members"
        description="People with access to this workspace."
        actions={<Button>+ Invite</Button>}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_MEMBERS.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.name}</TableCell>
              <TableCell>{m.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{m.role}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" disabled>
                  —
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-8">
        <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
          Pending invitations
        </h2>
        <p className="text-sm text-muted-foreground">No pending invitations.</p>
      </div>
    </div>
  );
}
