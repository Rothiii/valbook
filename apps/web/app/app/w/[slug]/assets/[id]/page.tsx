import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/shared/ui/tabs';

export const metadata: Metadata = { title: 'Asset detail · Valbook' };

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4">
        <Link href={`/app/w/${slug}/assets`} className="text-xs text-muted-foreground underline">
          ← Back to assets
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl">Asset name placeholder</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge>active</Badge>
            <span>·</span>
            <span>Category</span>
            <span>·</span>
            <span>Owner</span>
            <span>·</span>
            <span>Location</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          <Button variant="outline">⋮</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Current value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">Rp 0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">—</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="children">Sub-assets</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">Asset ID: {id}</p>
          <p className="text-sm text-muted-foreground">
            Custom fields will render here based on the category schema.
          </p>
        </TabsContent>
        <TabsContent value="valuation" className="mt-4">
          <p className="text-sm text-muted-foreground">Valuation history (Phase 3).</p>
        </TabsContent>
        <TabsContent value="attachments" className="mt-4">
          <p className="text-sm text-muted-foreground">Attachments (Phase 4).</p>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <p className="text-sm text-muted-foreground">Activity log (Phase 4).</p>
        </TabsContent>
        <TabsContent value="children" className="mt-4">
          <p className="text-sm text-muted-foreground">Sub-asset tree (Phase 2).</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
