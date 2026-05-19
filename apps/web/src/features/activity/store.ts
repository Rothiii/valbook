'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ActivityLog } from './types';

type ActivityState = {
  logs: Record<string, ActivityLog[]>; // workspaceId -> logs
};

type ActivityActions = {
  writeActivity: (entry: Omit<ActivityLog, 'id' | 'createdAt'>) => ActivityLog;
  clearWorkspace: (workspaceId: string) => void;
  reset: () => void;
};

const initialState: ActivityState = {
  logs: {},
};

function uuid(): string {
  return crypto.randomUUID();
}

export const useActivityStore = create<ActivityState & ActivityActions>()(
  persist(
    (set) => ({
      ...initialState,

      writeActivity: (entry) => {
        const log: ActivityLog = {
          ...entry,
          id: uuid(),
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const existing = state.logs[entry.workspaceId] ?? [];
          return {
            logs: {
              ...state.logs,
              [entry.workspaceId]: [log, ...existing].slice(0, 1000),
            },
          };
        });
        return log;
      },

      clearWorkspace: (workspaceId) => {
        set((state) => {
          const { [workspaceId]: _, ...rest } = state.logs;
          return { logs: rest };
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'valbook-activity',
      version: 1,
    },
  ),
);
