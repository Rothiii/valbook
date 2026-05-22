'use client';

import { useState } from 'react';
import { useAssets } from '@/src/features/asset/hooks/use-assets';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { notify } from '@/src/shared/lib/notify';
import { Badge } from '@/src/shared/ui/badge';
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
import { Label } from '@/src/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select';

import { useShareActions, useWorkspaceShares } from '../hooks/use-shares';
import type { PublicShare, ShareScope } from '../types';

export type SharingManagerProps = {
  workspaceId: string;
  workspaceName: string;
};

const EXPIRY_OPTIONS = [
  { label: 'Never', value: 'never' },
  { label: '1 day', value: '1' },
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
];

export function SharingManager({ workspaceId, workspaceName }: SharingManagerProps) {
  const shares = useWorkspaceShares(workspaceId);
  const { user } = useSession();
  const assets = useAssets(workspaceId, { includeArchived: false });
  const { createShare, revokeShare } = useShareActions();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<ShareScope>('workspace');
  const [assetId, setAssetId] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('never');

  const active = shares.filter((s) => s.revokedAt === null);
  const revoked = shares.filter((s) => s.revokedAt !== null);

  function expiryToIso(value: string): string | null {
    if (value === 'never') return null;
    const days = Number.parseInt(value, 10);
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  function handleCreate() {
    if (!user) return;
    if (scope === 'asset' && !assetId) {
      notify.error('Pick an asset');
      return;
    }
    const target = scope === 'asset' ? assets.find((a) => a.id === assetId) : null;
    createShare({
      workspaceId,
      scope,
      targetId: scope === 'workspace' ? workspaceId : assetId,
      expiresAt: expiryToIso(expiry),
      actorId: user.id,
      actorName: user.name,
      targetLabel: scope === 'workspace' ? workspaceName : target?.name,
    });
    notify.success('Share link created');
    setOpen(false);
    setAssetId('');
    setExpiry('never');
    setScope('workspace');
  }

  function handleRevoke(id: string) {
    if (!user) return;
    if (!confirm('Revoke this share link?')) return;
    revokeShare({ id, actorId: user.id, actorName: user.name });
    notify.success('Share revoked');
  }

  return (
    <div className="space-y-6">
      <div className="border border-destructive/30 bg-muted/30 p-3 text-xs text-muted-foreground">
        ⚠ Anyone with the link can view (read-only). Treat shared links like passwords.
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Create link</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create public link</DialogTitle>
              <DialogDescription>Read-only access to workspace or single asset.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as ShareScope)}>
                  <SelectTrigger id="scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workspace">Entire workspace</SelectItem>
                    <SelectItem value="asset">Single asset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {scope === 'asset' ? (
                <div className="space-y-2">
                  <Label htmlFor="asset">Asset</Label>
                  <Select value={assetId} onValueChange={setAssetId}>
                    <SelectTrigger id="asset">
                      <SelectValue placeholder="Pick asset…" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.length === 0 ? (
                        <div className="p-2 text-xs text-muted-foreground">No assets</div>
                      ) : (
                        assets.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger id="expiry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
          Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <EmptyState
            title="No active links"
            description="Create a link to share read-only data without giving full access."
            action={<Button onClick={() => setOpen(true)}>+ Create link</Button>}
          />
        ) : (
          <ul className="divide-y divide-border border border-border">
            {active.map((s) => (
              <ShareRow key={s.id} share={s} onRevoke={() => handleRevoke(s.id)} />
            ))}
          </ul>
        )}
      </section>

      {revoked.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
            Revoked ({revoked.length})
          </h2>
          <ul className="divide-y divide-border border border-border">
            {revoked.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground"
              >
                <span>
                  {s.scope} · revoked {new Date(s.revokedAt as string).toLocaleDateString()}
                </span>
                <code className="text-xs">{s.token.slice(0, 8)}…</code>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ShareRow({ share, onRevoke }: { share: PublicShare; onRevoke: () => void }) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${baseUrl}/public/${share.token}`;
  const expired = share.expiresAt && new Date(share.expiresAt).getTime() < Date.now();

  function copy() {
    navigator.clipboard.writeText(url).then(() => notify.success('Link copied'));
  }

  return (
    <li className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{share.scope}</Badge>
          {expired ? <Badge variant="destructive">expired</Badge> : null}
        </div>
        <code className="mt-1 block truncate text-xs text-muted-foreground">{url}</code>
        <p className="mt-1 text-xs text-muted-foreground">
          {share.expiresAt
            ? `Expires ${new Date(share.expiresAt).toLocaleDateString()}`
            : 'Never expires'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copy}>
          Copy
        </Button>
        <Button variant="ghost" size="sm" onClick={onRevoke}>
          Revoke
        </Button>
      </div>
    </li>
  );
}
