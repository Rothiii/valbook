'use client';

import { useActivityStore } from '../store';

export function useActivityLogs(workspaceId: string | null | undefined) {
  return useActivityStore((s) => (workspaceId ? (s.logs[workspaceId] ?? []) : []));
}

export function useWriteActivity() {
  return useActivityStore((s) => s.writeActivity);
}
