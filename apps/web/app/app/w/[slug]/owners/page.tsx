import type { Metadata } from 'next';

import { Button } from '@/src/shared/ui/button';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Owner labels · Valbook' };

export default function OwnersPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Owner labels"
        description="Track who owns each asset (person, company, joint, etc)."
        actions={<Button>+ New owner</Button>}
      />
      <EmptyState
        title="No owner labels yet"
        description="Create labels like Ayah, Ibu, PT XYZ, or Joint to assign asset ownership."
        action={<Button>+ New owner</Button>}
      />
    </div>
  );
}
