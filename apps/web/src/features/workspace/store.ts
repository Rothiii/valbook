'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';

import type { CreateWorkspaceInput, DeleteWorkspaceInput, UpdateWorkspaceInput } from './schema';
import type { Workspace, WorkspaceInvitation, WorkspaceMember } from './types';

type WorkspaceState = {
  workspaces: Workspace[];
  members: Record<string, WorkspaceMember[]>;
  invitations: Record<string, WorkspaceInvitation[]>;
  currentSlug: string | null;
};

type WorkspaceActions = {
  createWorkspace: (
    input: CreateWorkspaceInput & { ownerUserId: string; ownerName: string; ownerEmail: string },
  ) => Workspace;
  updateWorkspace: (input: UpdateWorkspaceInput) => void;
  deleteWorkspace: (input: DeleteWorkspaceInput) => void;
  setCurrentSlug: (slug: string | null) => void;
  reset: () => void;
};

const initialState: WorkspaceState = {
  workspaces: [],
  members: {},
  invitations: {},
  currentSlug: null,
};

function nowIso(): string {
  return new Date().toISOString();
}

function uuid(): string {
  return crypto.randomUUID();
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      createWorkspace: (input) => {
        const id = uuid();
        const now = nowIso();
        const workspace: Workspace = {
          id,
          slug: input.slug,
          name: input.name,
          displayCurrency: input.displayCurrency,
          ownerId: input.ownerUserId,
          settings: { templateId: input.templateId },
          createdAt: now,
          updatedAt: now,
        };
        const owner: WorkspaceMember = {
          id: uuid(),
          workspaceId: id,
          userId: input.ownerUserId,
          userName: input.ownerName,
          userEmail: input.ownerEmail,
          role: 'owner',
          joinedAt: now,
        };
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          members: { ...state.members, [id]: [owner] },
          invitations: { ...state.invitations, [id]: [] },
          currentSlug: input.slug,
        }));
        useActivityStore.getState().writeActivity({
          workspaceId: id,
          actorId: input.ownerUserId,
          actorName: input.ownerName,
          entityType: 'workspace',
          entityId: id,
          entityLabel: workspace.name,
          action: 'create',
          diff: { snapshot: workspace },
        });
        return workspace;
      },

      updateWorkspace: ({ slug, name, newSlug, displayCurrency }) => {
        const before = get().workspaces.find((w) => w.slug === slug);
        if (!before) return;
        set((state) => {
          const next = state.workspaces.map((w) =>
            w.slug === slug
              ? {
                  ...w,
                  name: name ?? w.name,
                  slug: newSlug ?? w.slug,
                  displayCurrency: displayCurrency ?? w.displayCurrency,
                  updatedAt: nowIso(),
                }
              : w,
          );
          return {
            workspaces: next,
            currentSlug: state.currentSlug === slug ? (newSlug ?? slug) : state.currentSlug,
          };
        });
        const after = get().workspaces.find((w) => w.id === before.id);
        if (after) {
          useActivityStore.getState().writeActivity({
            workspaceId: before.id,
            actorId: before.ownerId,
            actorName: 'Owner',
            entityType: 'workspace',
            entityId: before.id,
            entityLabel: after.name,
            action: 'update',
            diff: { before, after },
          });
        }
      },

      deleteWorkspace: ({ slug, confirm }) => {
        const ws = get().workspaces.find((w) => w.slug === slug);
        if (!ws) return;
        if (confirm !== ws.name) {
          throw new Error('Confirmation does not match workspace name');
        }
        set((state) => {
          const nextMembers = { ...state.members };
          delete nextMembers[ws.id];
          const nextInvitations = { ...state.invitations };
          delete nextInvitations[ws.id];
          return {
            workspaces: state.workspaces.filter((w) => w.id !== ws.id),
            members: nextMembers,
            invitations: nextInvitations,
            currentSlug: state.currentSlug === slug ? null : state.currentSlug,
          };
        });
        useActivityStore.getState().clearWorkspace(ws.id);
      },

      setCurrentSlug: (slug) => set({ currentSlug: slug }),

      reset: () => set(initialState),
    }),
    {
      name: 'valbook-workspace',
      version: 1,
    },
  ),
);
