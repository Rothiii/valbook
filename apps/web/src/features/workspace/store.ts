'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        return workspace;
      },

      updateWorkspace: ({ slug, name, newSlug, displayCurrency }) => {
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
      },

      deleteWorkspace: ({ slug, confirm }) => {
        const ws = get().workspaces.find((w) => w.slug === slug);
        if (!ws) return;
        if (confirm !== ws.name) {
          throw new Error('Confirmation does not match workspace name');
        }
        set((state) => {
          const { [ws.id]: _members, ...restMembers } = state.members;
          const { [ws.id]: _inv, ...restInvitations } = state.invitations;
          return {
            workspaces: state.workspaces.filter((w) => w.id !== ws.id),
            members: restMembers,
            invitations: restInvitations,
            currentSlug: state.currentSlug === slug ? null : state.currentSlug,
          };
        });
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
