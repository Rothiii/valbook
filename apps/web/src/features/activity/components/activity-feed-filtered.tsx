'use client';

import { useState } from 'react';

import { EmptyState } from '@/src/shared/ui/empty-state';
import { Input } from '@/src/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select';

import { useActivityLogs } from '../hooks/use-activity';
import type { ActivityAction, ActivityEntityType, ActivityLog } from '../types';

const ENTITY_TYPES: Array<{ value: ActivityEntityType; label: string }> = [
  { value: 'workspace', label: 'workspace' },
  { value: 'asset', label: 'asset' },
  { value: 'category', label: 'category' },
  { value: 'field', label: 'field' },
  { value: 'owner_label', label: 'owner_label' },
  { value: 'tag', label: 'tag' },
  { value: 'member', label: 'member' },
  { value: 'invitation', label: 'invitation' },
  { value: 'valuation', label: 'valuation' },
  { value: 'attachment', label: 'attachment' },
  { value: 'share', label: 'share' },
];

const ACTIONS: Array<{ value: ActivityAction; label: string }> = [
  { value: 'create', label: 'create' },
  { value: 'update', label: 'update' },
  { value: 'delete', label: 'delete' },
  { value: 'archive', label: 'archive' },
  { value: 'unarchive', label: 'unarchive' },
  { value: 'reparent', label: 'reparent' },
  { value: 'bulk_import', label: 'bulk_import' },
  { value: 'invite', label: 'invite' },
  { value: 'accept', label: 'accept' },
  { value: 'role_change', label: 'role_change' },
  { value: 'remove', label: 'remove' },
  { value: 'leave', label: 'leave' },
  { value: 'upload', label: 'upload' },
  { value: 'revoke', label: 'revoke' },
  { value: 'transfer', label: 'transfer' },
];

export function ActivityFeedFiltered({ workspaceId }: { workspaceId: string }) {
  const logs = useActivityLogs(workspaceId);
  const [actorQuery, setActorQuery] = useState('');
  const [entityType, setEntityType] = useState<string>('__all');
  const [action, setAction] = useState<string>('__all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = logs.filter((log) => {
    if (actorQuery && !log.actorName.toLowerCase().includes(actorQuery.toLowerCase())) {
      return false;
    }
    if (entityType !== '__all' && log.entityType !== entityType) return false;
    if (action !== '__all' && log.action !== action) return false;
    const t = new Date(log.createdAt).getTime();
    if (dateFrom && t < new Date(dateFrom).getTime()) return false;
    if (dateTo && t > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000) return false;
    return true;
  });

  const grouped = groupByDay(filtered);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Filter by actor name…"
          value={actorQuery}
          onChange={(e) => setActorQuery(e.target.value)}
        />
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger>
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All entities</SelectItem>
            {ENTITY_TYPES.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger>
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All actions</SelectItem>
            {ACTIONS.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {logs.length} entries
      </p>

      {grouped.length === 0 ? (
        <EmptyState
          title="No activity matches"
          description="Try clearing filters or pick a wider date range."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ day, logs: dayLogs }) => (
            <div key={day}>
              <h3 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{day}</h3>
              <ul className="divide-y divide-border border border-border">
                {dayLogs.map((log) => (
                  <li key={log.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                    <span className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                      {log.action}
                    </span>
                    <div className="flex-1">
                      <p>
                        <span className="text-foreground">{log.actorName}</span>{' '}
                        <span className="text-muted-foreground">
                          {log.action} {log.entityType}
                        </span>{' '}
                        {log.entityLabel ? (
                          <span className="text-foreground">{log.entityLabel}</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByDay(logs: ActivityLog[]): Array<{ day: string; logs: ActivityLog[] }> {
  const map = new Map<string, ActivityLog[]>();
  for (const log of logs) {
    const day = new Date(log.createdAt).toLocaleDateString();
    map.set(day, [...(map.get(day) ?? []), log]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([day, items]) => ({ day, logs: items }));
}
