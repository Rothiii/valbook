import type { Metadata } from 'next';

import { Button } from '@/src/shared/ui/button';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Categories · Valbook' };

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Categories"
        description="Define asset types and their custom fields."
        actions={<Button>+ New category</Button>}
      />
      <EmptyState
        title="No categories yet"
        description="Create categories like Laptop, Rumah, or Crypto. Add custom fields per category."
        action={<Button>+ New category</Button>}
      />
    </div>
  );
}
