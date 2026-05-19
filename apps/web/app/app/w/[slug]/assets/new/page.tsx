import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/src/shared/ui/button';
import { Card, CardContent } from '@/src/shared/ui/card';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';
import { PageHeader } from '@/src/shared/ui/page-header';
import { Textarea } from '@/src/shared/ui/textarea';

export const metadata: Metadata = { title: 'Add asset · Valbook' };

export default async function NewAssetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add asset" description="Create a new asset in this workspace." />

      <Card>
        <CardContent className="pt-6">
          <form className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="category">Category *</Label>
                <Input id="category" placeholder="Pick category…" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" placeholder="Serial / SKU" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input id="status" defaultValue="active" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner label</Label>
                <Input id="owner" placeholder="Pick owner…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" />
              </div>
            </section>

            <section className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm uppercase tracking-wider text-muted-foreground">
                Purchase
              </h3>
              <div className="space-y-2">
                <Label htmlFor="purchase-price">Price</Label>
                <Input id="purchase-price" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-currency">Currency</Label>
                <Input id="purchase-currency" defaultValue="IDR" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-date">Date</Label>
                <Input id="purchase-date" type="date" />
              </div>
            </section>

            <section className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <h3 className="col-span-full text-sm uppercase tracking-wider text-muted-foreground">
                Current value
              </h3>
              <div className="space-y-2">
                <Label htmlFor="current-value">Value</Label>
                <Input id="current-value" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-currency">Currency</Label>
                <Input id="current-currency" defaultValue="IDR" />
              </div>
            </section>

            <section className="space-y-2 border-t border-border pt-6">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} />
            </section>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-6">
              <Button variant="ghost" asChild>
                <Link href={`/app/w/${slug}/assets`}>Cancel</Link>
              </Button>
              <Button type="submit">Save asset</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
