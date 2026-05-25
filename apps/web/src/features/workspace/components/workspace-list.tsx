'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, MoreVertical, Share2, SquareCheck, Trash2, UserPlus, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useSession } from '@/src/features/auth/hooks/use-session';
import { notify } from '@/src/shared/lib/notify';
import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { Checkbox } from '@/src/shared/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu';
import { EmptyState } from '@/src/shared/ui/empty-state';
import { cn } from '@/src/shared/utils/cn';

import { useMembershipActions, useWorkspaceActions } from '../hooks/use-workspace-actions';
import { useWorkspaceMembers } from '../hooks/use-workspace-members';
import { useCurrentMembership, useWorkspaces } from '../hooks/use-workspaces';
import type { Workspace, WorkspaceRole } from '../types';
import { InviteMemberDialog } from './invite-member-dialog';

export function WorkspaceList() {
  const workspaces = useWorkspaces();
  const { user } = useSession();
  const { deleteWorkspace } = useWorkspaceActions();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clear() {
    setSelected(new Set());
  }

  function deleteSelected() {
    const targets = workspaces.filter((w) => selected.has(w.id) && w.ownerId === user?.id);
    const skipped = selected.size - targets.length;
    let success = 0;
    for (const ws of targets) {
      try {
        deleteWorkspace({ slug: ws.slug, confirm: ws.name });
        success++;
      } catch (error) {
        notify.error(`Failed to delete ${ws.name}`, {
          description: error instanceof Error ? error.message : undefined,
        });
      }
    }
    if (success > 0) notify.success(`${success} workspace deleted`);
    if (skipped > 0) notify.info(`${skipped} skipped (owner only)`);
    clear();
  }

  if (workspaces.length === 0) {
    return (
      <EmptyState
        title="No workspaces yet"
        description="Create your first workspace to start tracking assets."
        action={
          <Button asChild>
            <Link href="/onboarding">Create workspace</Link>
          </Button>
        }
      />
    );
  }

  const selectMode = selected.size > 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((ws) => (
          <WorkspaceCard
            key={ws.id}
            workspace={ws}
            isSelected={selected.has(ws.id)}
            selectMode={selectMode}
            onToggle={() => toggle(ws.id)}
          />
        ))}
      </div>

      <SelectionBar count={selected.size} onClose={clear} onDelete={deleteSelected} />
    </>
  );
}

interface CardProps {
  workspace: Workspace;
  isSelected: boolean;
  selectMode: boolean;
  onToggle: () => void;
}

function WorkspaceCard({ workspace, isSelected, selectMode, onToggle }: CardProps) {
  const members = useWorkspaceMembers(workspace.id);
  const { user } = useSession();
  const membership = useCurrentMembership(workspace.id);
  const { leaveWorkspace } = useMembershipActions();
  const [inviteOpen, setInviteOpen] = useState(false);

  const role = membership.role;
  const isOwner = role === 'owner';

  function handleCopyLink() {
    const url = `${window.location.origin}/app/w/${workspace.slug}`;
    navigator.clipboard.writeText(url);
    notify.success('Workspace link copied');
  }

  function handleLeave() {
    if (!user) return;
    try {
      leaveWorkspace({ workspaceId: workspace.id, userId: user.id, userName: user.name });
      notify.success('Left workspace');
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed');
    }
  }

  const cardBody = (
    <Card
      className={cn(
        'h-full transition-colors',
        isSelected ? 'border-foreground ring-2 ring-ring/40' : 'hover:border-foreground',
      )}
    >
      <CardHeader className="pl-10 pr-10">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{workspace.name}</CardTitle>
          {role ? <RoleBadge role={role} /> : null}
        </div>
        <CardDescription>
          {members.length} member{members.length === 1 ? '' : 's'} · {workspace.displayCurrency}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">/{workspace.slug}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="group/card relative">
      {selectMode ? (
        <button type="button" onClick={onToggle} className="block w-full text-left">
          {cardBody}
        </button>
      ) : (
        <Link href={`/app/w/${workspace.slug}`} className="block">
          {cardBody}
        </Link>
      )}

      <div
        className={cn(
          'absolute left-3 top-3 z-10 transition-opacity',
          isSelected || selectMode ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100',
        )}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          aria-label={`Select ${workspace.name}`}
        />
      </div>

      <div
        className={cn(
          'absolute right-2 top-2 z-10 transition-opacity',
          'opacity-0 group-hover/card:opacity-100 has-data-[state=open]:opacity-100',
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Open workspace menu">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleCopyLink}>
              <Share2 /> Copy link
            </DropdownMenuItem>
            {isOwner ? (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setInviteOpen(true);
                }}
              >
                <UserPlus /> Invite member
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onSelect={onToggle}>
              <SquareCheck /> Pilih item
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isOwner ? (
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  if (!isSelected) onToggle();
                }}
              >
                <Trash2 /> Hapus
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem variant="destructive" onSelect={handleLeave}>
                <LogOut /> Leave workspace
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isOwner ? (
        <InviteMemberDialog
          workspaceId={workspace.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      ) : null}
    </div>
  );
}

function RoleBadge({ role }: { role: WorkspaceRole }) {
  const label = role.charAt(0).toUpperCase() + role.slice(1);
  const variant = role === 'owner' ? 'default' : role === 'editor' ? 'secondary' : 'outline';
  return (
    <Badge variant={variant} className="text-[10px] uppercase tracking-wider">
      {label}
    </Badge>
  );
}

interface SelectionBarProps {
  count: number;
  onClose: () => void;
  onDelete: () => void;
}

function SelectionBar({ count, onClose, onDelete }: SelectionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex min-w-[320px] items-center gap-4 rounded-xl border border-border bg-card px-5 py-2.5 shadow-lg">
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Clear selection">
              <X />
            </Button>
            <span className="flex-1 text-sm font-medium">{count} dipilih</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              aria-label="Delete selected"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
            >
              <Trash2 />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
