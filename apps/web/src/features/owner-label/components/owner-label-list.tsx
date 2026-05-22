'use client';

import { useState } from 'react';
import { useSession } from '@/src/features/auth/hooks/use-session';
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
import { EmptyState } from '@/src/shared/ui/empty-state';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';

import { useOwnerLabelActions, useOwnerLabels } from '../hooks/use-owner-labels';
import type { OwnerLabel } from '../types';

export function OwnerLabelList({ workspaceId }: { workspaceId: string }) {
  const owners = useOwnerLabels(workspaceId);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateOwnerDialog workspaceId={workspaceId} open={open} onOpenChange={setOpen} />
      </div>

      {owners.length === 0 ? (
        <EmptyState
          title="No owner labels yet"
          description="Create labels like Ayah, Ibu, PT XYZ, or Joint."
          action={<Button onClick={() => setOpen(true)}>+ New owner</Button>}
        />
      ) : (
        <ul className="divide-y divide-border border border-border">
          {owners.map((o) => (
            <OwnerRow key={o.id} owner={o} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CreateOwnerDialog({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useSession();
  const { createOwnerLabel } = useOwnerLabelActions();
  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name) return;
    createOwnerLabel({
      workspaceId,
      name,
      color: color || undefined,
      actorId: user.id,
      actorName: user.name,
    });
    notify.success('Owner label created');
    setName('');
    setColor('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>+ New owner</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New owner label</DialogTitle>
          <DialogDescription>Used to assign asset ownership.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner-name">Name</Label>
            <Input
              id="owner-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner-color">Color (hex)</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick color"
                value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : '#737373'}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
              />
              <Input
                id="owner-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#737373"
                className="flex-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OwnerRow({ owner }: { owner: OwnerLabel }) {
  const { user } = useSession();
  const { deleteOwnerLabel } = useOwnerLabelActions();
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        <span
          className="inline-block h-3 w-3 border border-border"
          style={{ background: owner.color ?? 'transparent' }}
        />
        <span>{owner.name}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (!user) return;
          if (confirm(`Delete owner "${owner.name}"?`)) {
            deleteOwnerLabel({ id: owner.id, actorId: user.id, actorName: user.name });
            notify.success('Deleted');
          }
        }}
      >
        Delete
      </Button>
    </li>
  );
}
