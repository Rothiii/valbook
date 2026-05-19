'use client';

import Link from 'next/link';

import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { EmptyState } from '@/src/shared/ui/empty-state';

import { useWorkspaceMembers } from '../hooks/use-workspace-members';
import { useWorkspaces } from '../hooks/use-workspaces';
import type { Workspace } from '../types';

export function WorkspaceList() {
  const workspaces = useWorkspaces();

  if (workspaces.length === 0) {
    return (
      <EmptyState
        title="No workspaces yet"
        description="Create your first workspace to start tracking assets."
        action={
          <Button asChild>
            <Link href="/onboarding">Create workspace</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((ws) => (
        <WorkspaceCard key={ws.id} workspace={ws} />
      ))}
    </div>
  );
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const members = useWorkspaceMembers(workspace.id);
  return (
    <Link href={`/app/w/${workspace.slug}`} className="block">
      <Card className="h-full hover:border-foreground">
        <CardHeader>
          <CardTitle className="text-base">{workspace.name}</CardTitle>
          <CardDescription>
            {members.length} member{members.length === 1 ? '' : 's'} · {workspace.displayCurrency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">/{workspace.slug}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
