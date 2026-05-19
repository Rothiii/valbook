import type { Metadata } from 'next';

import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Workspace settings · Valbook' };

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" description="Workspace configuration." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
            <CardDescription>Name, slug, and display preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={slug} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" defaultValue={slug} />
              <p className="text-xs text-muted-foreground">URL-safe identifier.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Display currency</Label>
              <Input id="currency" defaultValue="IDR" />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transfer ownership</CardTitle>
            <CardDescription>Pass owner role to another member.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Transfer ownership</Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
            <CardDescription>Permanently delete this workspace and all its data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete workspace</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
