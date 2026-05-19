'use client';

import { EmptyState } from '@/src/shared/ui/empty-state';

import { useActivityLogs } from '../hooks/use-activity';
import type { ActivityLog } from '../types';

export type ActivityFeedProps = {
  workspaceId: string;
  limit?: number;
};

export function ActivityFeed({ workspaceId, limit }: ActivityFeedProps) {
  const logs = useActivityLogs(workspaceId);
  const trimmed = typeof limit === 'number' ? logs.slice(0, limit) : logs;

  if (trimmed.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Edits, additions, and member events will appear here."
      />
    );
  }

  return (
    <ul className="divide-y divide-border border border-border">
      {trimmed.map((log) => (
        <ActivityRow key={log.id} log={log} />
      ))}
    </ul>
  );
}

function ActivityRow({ log }: { log: ActivityLog }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3 text-sm">
      <span className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
        {log.action}
      </span>
      <div className="flex-1">
        <p>
          <span className="text-foreground">{log.actorName}</span>{' '}
          <span className="text-muted-foreground">
            {actionVerb(log.action)} {log.entityType}
          </span>{' '}
          {log.entityLabel ? <span className="text-foreground">{log.entityLabel}</span> : null}
        </p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(log.createdAt)}</p>
      </div>
    </li>
  );
}

function actionVerb(action: ActivityLog['action']): string {
  switch (action) {
    case 'create':
      return 'created';
    case 'update':
      return 'updated';
    case 'delete':
      return 'deleted';
    case 'archive':
      return 'archived';
    case 'unarchive':
      return 'unarchived';
    case 'reparent':
      return 'moved';
    case 'bulk_import':
      return 'bulk-imported';
    case 'invite':
      return 'invited';
    case 'accept':
      return 'accepted';
    case 'role_change':
      return 'changed role on';
    case 'remove':
      return 'removed';
    case 'leave':
      return 'left';
    case 'upload':
      return 'uploaded';
    case 'revoke':
      return 'revoked';
    case 'transfer':
      return 'transferred';
    default:
      return action;
  }
}

function formatRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}
