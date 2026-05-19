'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useSession } from '@/src/features/auth/hooks/use-session';
import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/ui/dialog';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';

import { useTagActions, useTags } from '../hooks/use-tags';

export function TagList({ workspaceId }: { workspaceId: string }) {
  const tags = useTags(workspaceId);
  const { user } = useSession();
  const { createTag, deleteTag } = useTagActions();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name) return;
    try {
      createTag({
        workspaceId,
        name,
        color: color || undefined,
        actorId: user.id,
        actorName: user.name,
      });
      toast.success('Tag created');
      setName('');
      setColor('');
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed');
    }
  }

  function handleDelete(id: string, name: string) {
    if (!user) return;
    if (!confirm(`Delete tag "${name}"?`)) return;
    deleteTag({ id, actorId: user.id, actorName: user.name });
    toast.success('Tag deleted');
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ New tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tag-name">Name *</Label>
                <Input
                  id="tag-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-color">Color (hex)</Label>
                <Input
                  id="tag-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#737373"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {tags.length === 0 ? (
        <EmptyState
          title="No tags yet"
          description="Create tags to group and filter assets across categories."
          action={<Button onClick={() => setOpen(true)}>+ New tag</Button>}
        />
      ) : (
        <ul className="divide-y divide-border border border-border">
          {tags.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <Badge
                  style={t.color ? { background: t.color, color: '#fafafa' } : undefined}
                  variant="secondary"
                >
                  {t.name}
                </Badge>
                <span className="text-xs text-muted-foreground">{t.color ?? '—'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id, t.name)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
