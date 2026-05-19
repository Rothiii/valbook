import type { Metadata } from 'next';

import { Button } from '@/src/shared/ui/button';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { Input } from '@/src/shared/ui/input';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Activity · Valbook' };

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Activity" description="All mutations in this workspace." />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Filter by actor…" className="w-48" />
        <Button variant="outline" size="sm">
          Entity type
        </Button>
        <Button variant="outline" size="sm">
          Action
        </Button>
        <Button variant="outline" size="sm">
          Date range
        </Button>
      </div>

      <EmptyState
        title="No activity yet"
        description="Asset edits, valuation changes, and member events will appear here."
      />
    </div>
  );
}
