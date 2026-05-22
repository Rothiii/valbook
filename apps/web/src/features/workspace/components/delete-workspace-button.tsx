'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { notify } from '@/src/shared/lib/notify';

import { Button } from '@/src/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/ui/dialog';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';

import { useWorkspaceActions } from '../hooks/use-workspace-actions';
import type { Workspace } from '../types';

export function DeleteWorkspaceButton({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const { deleteWorkspace } = useWorkspaceActions();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState('');

  function handleDelete() {
    try {
      deleteWorkspace({ slug: workspace.slug, confirm });
      notify.success('Workspace deleted');
      router.push('/app');
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Delete failed');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete workspace</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {workspace.name}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All assets, categories, valuations, and activity will be
            permanently removed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="confirm">
            Type <strong>{workspace.name}</strong> to confirm
          </Label>
          <Input
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirm !== workspace.name}
            onClick={handleDelete}
          >
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
