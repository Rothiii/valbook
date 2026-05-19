import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Workspaces · Valbook' };

const MOCK_WORKSPACES: Array<{
  slug: string;
  name: string;
  assetCount: number;
  memberCount: number;
}> = [];

export default function WorkspacesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <PageHeader
        title="Workspaces"
        description="All workspaces you're a member of."
        actions={
          <Button asChild>
            <Link href="/onboarding">+ New workspace</Link>
          </Button>
        }
      />

      {MOCK_WORKSPACES.length === 0 ? (
        <EmptyState
          title="No workspaces yet"
          description="Create your first workspace to start tracking assets."
          action={
            <Button asChild>
              <Link href="/onboarding">Create workspace</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_WORKSPACES.map((ws) => (
            <Card key={ws.slug} className="hover:border-foreground">
              <Link href={`/app/w/${ws.slug}`}>
                <CardHeader>
                  <CardTitle className="text-base">{ws.name}</CardTitle>
                  <CardDescription>
                    {ws.assetCount} assets · {ws.memberCount} members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">/{ws.slug}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
