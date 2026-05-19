import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { Input } from '@/src/shared/ui/input';
import { PageHeader } from '@/src/shared/ui/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table';

export const metadata: Metadata = { title: 'Assets · Valbook' };

const MOCK_ASSETS: Array<{
  id: string;
  name: string;
  code: string;
  category: string;
  owner: string;
  status: 'active' | 'archived';
  value: string;
}> = [];

export default async function AssetsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Assets"
        description="All assets in this workspace."
        actions={
          <Button asChild>
            <Link href={`/app/w/${slug}/assets/new`}>+ Add asset</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search name or code…" className="w-64" />
        <Button variant="outline" size="sm">
          Category
        </Button>
        <Button variant="outline" size="sm">
          Owner
        </Button>
        <Button variant="outline" size="sm">
          Status
        </Button>
        <Button variant="outline" size="sm">
          Tags
        </Button>
      </div>

      {MOCK_ASSETS.length === 0 ? (
        <EmptyState
          title="No assets yet"
          description="Add your first asset or import from CSV."
          action={
            <Button asChild>
              <Link href={`/app/w/${slug}/assets/new`}>+ Add asset</Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ASSETS.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <Link href={`/app/w/${slug}/assets/${a.id}`} className="underline">
                    {a.name}
                  </Link>
                </TableCell>
                <TableCell>{a.code}</TableCell>
                <TableCell>{a.category}</TableCell>
                <TableCell>{a.owner}</TableCell>
                <TableCell>
                  <Badge variant={a.status === 'active' ? 'default' : 'secondary'}>
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{a.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
