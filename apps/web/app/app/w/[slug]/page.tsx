import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Dashboard · Valbook' };

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Dashboard"
        description={`Overview for ${slug}`}
        actions={
          <Button asChild>
            <Link href={`/app/w/${slug}/assets/new`}>+ Add asset</Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Total value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">Rp 0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Growth 1M
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">—</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By category</CardTitle>
            <CardDescription>Distribution chart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
              No data yet
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By owner</CardTitle>
            <CardDescription>Distribution chart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
              No data yet
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nothing here yet"
            description="Activity will appear once you add or update assets."
            action={
              <Button asChild>
                <Link href={`/app/w/${slug}/assets/new`}>+ Add asset</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
