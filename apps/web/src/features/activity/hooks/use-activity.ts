'use client';

import { useShallow } from 'zustand/react/shallow';

import { useActivityStore } from '../store';
import type { ActivityLog } from '../types';

const EMPTY_LOGS: ActivityLog[] = [];

export function useActivityLogs(workspaceId: string | null | undefined) {
  return useActivityStore(
    useShallow((s) => (workspaceId ? (s.logs[workspaceId] ?? EMPTY_LOGS) : EMPTY_LOGS)),
  );
}

export function useWriteActivity() {
  return useActivityStore((s) => s.writeActivity);
}
