import type { Metadata } from 'next';

import { Button } from '@/src/shared/ui/button';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Tags · Valbook' };

export default function TagsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Tags"
        description="Multi-value labels for assets (e.g. work, portable, depreciate-fast)."
        actions={<Button>+ New tag</Button>}
      />
      <EmptyState
        title="No tags yet"
        description="Create tags to group and filter assets across categories."
        action={<Button>+ New tag</Button>}
      />
    </div>
  );
}
