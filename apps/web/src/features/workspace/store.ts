'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';

import type {
  CreateWorkspaceInput,
  DeleteWorkspaceInput,
  InviteMemberInput,
  UpdateWorkspaceInput,
} from './schema';
import type { Workspace, WorkspaceInvitation, WorkspaceMember, WorkspaceRole } from './types';

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
  inviteMember: (
    input: InviteMemberInput & { actorId: string; actorName: string },
  ) => WorkspaceInvitation;
  revokeInvitation: (input: { invitationId: string; actorId: string; actorName: string }) => void;
  resendInvitation: (input: { invitationId: string }) => WorkspaceInvitation | null;
  acceptInvitation: (input: {
    token: string;
    userId: string;
    userName: string;
    userEmail: string;
  }) => { workspaceSlug: string };
  updateMemberRole: (input: {
    memberId: string;
    role: WorkspaceRole;
    actorId: string;
    actorName: string;
  }) => void;
  removeMember: (input: { memberId: string; actorId: string; actorName: string }) => void;
  leaveWorkspace: (input: { workspaceId: string; userId: string; userName: string }) => void;
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

      inviteMember: ({ workspaceId, email, role, actorId, actorName }) => {
        const existingMembers = get().members[workspaceId] ?? [];
        if (existingMembers.some((m) => m.userEmail.toLowerCase() === email.toLowerCase())) {
          throw new Error('User is already a member');
        }
        const existingInvitations = get().invitations[workspaceId] ?? [];
        if (
          existingInvitations.some(
            (inv) => inv.email.toLowerCase() === email.toLowerCase() && inv.acceptedAt === null,
          )
        ) {
          throw new Error('An invitation is already pending for this email');
        }
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        const invitation: WorkspaceInvitation = {
          id: uuid(),
          workspaceId,
          email,
          role,
          token: `${uuid().replace(/-/g, '')}${uuid().replace(/-/g, '')}`.slice(0, 48),
          invitedBy: actorId,
          expiresAt: expires.toISOString(),
          acceptedAt: null,
        };
        set((state) => ({
          invitations: {
            ...state.invitations,
            [workspaceId]: [...existingInvitations, invitation],
          },
        }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'invitation',
          entityId: invitation.id,
          entityLabel: email,
          action: 'invite',
          diff: { snapshot: invitation },
        });
        return invitation;
      },

      revokeInvitation: ({ invitationId, actorId, actorName }) => {
        let target: WorkspaceInvitation | null = null;
        set((state) => {
          const next: Record<string, WorkspaceInvitation[]> = {};
          for (const [wsId, list] of Object.entries(state.invitations)) {
            next[wsId] = list.filter((inv) => {
              if (inv.id === invitationId) {
                target = inv;
                return false;
              }
              return true;
            });
          }
          return { invitations: next };
        });
        if (target) {
          const t = target as WorkspaceInvitation;
          useActivityStore.getState().writeActivity({
            workspaceId: t.workspaceId,
            actorId,
            actorName,
            entityType: 'invitation',
            entityId: t.id,
            entityLabel: t.email,
            action: 'revoke',
          });
        }
      },

      resendInvitation: ({ invitationId }) => {
        const all = Object.values(get().invitations).flat();
        const inv = all.find((i) => i.id === invitationId);
        if (!inv) return null;
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        const refreshed: WorkspaceInvitation = {
          ...inv,
          token: `${uuid().replace(/-/g, '')}${uuid().replace(/-/g, '')}`.slice(0, 48),
          expiresAt: expires.toISOString(),
        };
        set((state) => ({
          invitations: {
            ...state.invitations,
            [inv.workspaceId]: (state.invitations[inv.workspaceId] ?? []).map((i) =>
              i.id === invitationId ? refreshed : i,
            ),
          },
        }));
        return refreshed;
      },

      acceptInvitation: ({ token, userId, userName, userEmail }) => {
        const all = Object.values(get().invitations).flat();
        const inv = all.find((i) => i.token === token);
        if (!inv) throw new Error('Invalid invitation token');
        if (inv.acceptedAt) throw new Error('Invitation already accepted');
        if (new Date(inv.expiresAt).getTime() < Date.now()) {
          throw new Error('Invitation expired');
        }
        if (inv.email.toLowerCase() !== userEmail.toLowerCase()) {
          throw new Error('Sign in with the email this invitation was sent to');
        }
        const workspace = get().workspaces.find((w) => w.id === inv.workspaceId);
        if (!workspace) throw new Error('Workspace no longer exists');
        const now = nowIso();
        const member: WorkspaceMember = {
          id: uuid(),
          workspaceId: inv.workspaceId,
          userId,
          userName,
          userEmail,
          role: inv.role,
          joinedAt: now,
        };
        set((state) => ({
          members: {
            ...state.members,
            [inv.workspaceId]: [...(state.members[inv.workspaceId] ?? []), member],
          },
          invitations: {
            ...state.invitations,
            [inv.workspaceId]: (state.invitations[inv.workspaceId] ?? []).map((i) =>
              i.id === inv.id ? { ...i, acceptedAt: now } : i,
            ),
          },
        }));
        useActivityStore.getState().writeActivity({
          workspaceId: inv.workspaceId,
          actorId: userId,
          actorName: userName,
          entityType: 'member',
          entityId: member.id,
          entityLabel: userName,
          action: 'accept',
          diff: { snapshot: member },
        });
        return { workspaceSlug: workspace.slug };
      },

      updateMemberRole: ({ memberId, role, actorId, actorName }) => {
        let target: WorkspaceMember | null = null;
        let workspaceId: string | null = null;
        set((state) => {
          const next: Record<string, WorkspaceMember[]> = {};
          for (const [wsId, list] of Object.entries(state.members)) {
            next[wsId] = list.map((m) => {
              if (m.id !== memberId) return m;
              if (m.role === 'owner') {
                throw new Error('Cannot change owner role. Transfer ownership first.');
              }
              target = m;
              workspaceId = wsId;
              return { ...m, role };
            });
          }
          return { members: next };
        });
        if (target && workspaceId) {
          const tm = target as WorkspaceMember;
          useActivityStore.getState().writeActivity({
            workspaceId: workspaceId as string,
            actorId,
            actorName,
            entityType: 'member',
            entityId: tm.id,
            entityLabel: tm.userName,
            action: 'role_change',
            diff: { before: tm.role, after: role },
          });
        }
      },

      removeMember: ({ memberId, actorId, actorName }) => {
        let target: WorkspaceMember | null = null;
        let workspaceId: string | null = null;
        set((state) => {
          const next: Record<string, WorkspaceMember[]> = {};
          for (const [wsId, list] of Object.entries(state.members)) {
            next[wsId] = list.filter((m) => {
              if (m.id !== memberId) return true;
              if (m.role === 'owner') {
                throw new Error('Cannot remove owner. Transfer ownership first.');
              }
              target = m;
              workspaceId = wsId;
              return false;
            });
          }
          return { members: next };
        });
        if (target && workspaceId) {
          const tm = target as WorkspaceMember;
          useActivityStore.getState().writeActivity({
            workspaceId: workspaceId as string,
            actorId,
            actorName,
            entityType: 'member',
            entityId: tm.id,
            entityLabel: tm.userName,
            action: 'remove',
          });
        }
      },

      leaveWorkspace: ({ workspaceId, userId, userName }) => {
        const members = get().members[workspaceId] ?? [];
        const me = members.find((m) => m.userId === userId);
        if (!me) return;
        if (me.role === 'owner') {
          throw new Error('Owner cannot leave. Transfer ownership first.');
        }
        set((state) => ({
          members: {
            ...state.members,
            [workspaceId]: (state.members[workspaceId] ?? []).filter((m) => m.id !== me.id),
          },
        }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId: userId,
          actorName: userName,
          entityType: 'member',
          entityId: me.id,
          entityLabel: userName,
          action: 'leave',
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'valbook-workspace',
      version: 1,
    },
  ),
);
