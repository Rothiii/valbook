import type { Metadata } from 'next';

import { Button } from '@/src/shared/ui/button';
import { Card, CardContent } from '@/src/shared/ui/card';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { PageHeader } from '@/src/shared/ui/page-header';

export const metadata: Metadata = { title: 'Sharing · Valbook' };

export default function SharingPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Sharing"
        description="Generate public read-only links to this workspace or specific assets."
        actions={<Button>+ Create link</Button>}
      />

      <Card className="mb-6 border-destructive/30">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          ⚠️ Anyone with the link can view (read-only). Treat shared links like passwords.
        </CardContent>
      </Card>

      <EmptyState
        title="No active links"
        description="Create a public link to share your workspace data without giving full access."
        action={<Button>+ Create link</Button>}
      />
    </div>
  );
}
