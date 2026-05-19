'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useSession } from '@/src/features/auth/hooks/use-session';
import { Button } from '@/src/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/ui/dialog';
import { EmptyState } from '@/src/shared/ui/empty-state';

import { useCategories, useCategoryActions } from '../hooks/use-categories';
import type { Category } from '../types';
import { CategoryForm } from './category-form';

export type CategoryListProps = {
  workspaceId: string;
};

export function CategoryList({ workspaceId }: CategoryListProps) {
  const categories = useCategories(workspaceId);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>+ New category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New category</DialogTitle>
              <DialogDescription>Used to classify assets in this workspace.</DialogDescription>
            </DialogHeader>
            <CategoryForm workspaceId={workspaceId} onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create categories like Laptop, Rumah, or Crypto."
          action={<Button onClick={() => setCreateOpen(true)}>+ New category</Button>}
        />
      ) : (
        <ul className="divide-y divide-border border border-border">
          {categories.map((c) => (
            <CategoryRow key={c.id} category={c} workspaceId={workspaceId} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryRow({ category, workspaceId }: { category: Category; workspaceId: string }) {
  const { user } = useSession();
  const { deleteCategory } = useCategoryActions();
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="text-lg">{category.icon ?? '◯'}</span>
        <div>
          <p>{category.name}</p>
          <p className="text-xs text-muted-foreground">{category.color ?? '—'}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (!user) return;
          if (confirm(`Delete category "${category.name}"?`)) {
            try {
              deleteCategory({
                id: category.id,
                workspaceId,
                actorId: user.id,
                actorName: user.name,
              });
              toast.success('Category deleted');
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Failed');
            }
          }
        }}
      >
        Delete
      </Button>
    </li>
  );
}
