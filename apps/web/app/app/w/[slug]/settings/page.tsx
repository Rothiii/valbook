'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { DeleteWorkspaceButton } from '@/src/features/workspace/components/delete-workspace-button';
import { WorkspaceSettingsForm } from '@/src/features/workspace/components/workspace-settings-form';
import { useWorkspaceBySlug } from '@/src/features/workspace/hooks/use-workspaces';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { PageHeader } from '@/src/shared/ui/page-header';

export default function WorkspaceSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const workspace = useWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" description="Workspace configuration." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
            <CardDescription>Name, slug, and display preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkspaceSettingsForm workspace={workspace} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transfer ownership</CardTitle>
            <CardDescription>Pass owner role to another member (Phase 2).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Transfer ownership
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
            <CardDescription>Permanently delete this workspace and all its data.</CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteWorkspaceButton workspace={workspace} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
