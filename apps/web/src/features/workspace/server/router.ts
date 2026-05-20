import { TRPCError } from '@trpc/server';

import { ownerProcedure, protectedProcedure, router, workspaceProcedure } from '@/src/server/trpc';
import { slugSchema } from '@/src/shared/types/common';

import { createWorkspaceSchema, deleteWorkspaceSchema, updateWorkspaceSchema } from '../schema';
import {
  createWorkspaceWithTemplate,
  deleteWorkspace as deleteWorkspaceService,
  getWorkspaceMembership,
  listWorkspacesForUser,
  updateWorkspace as updateWorkspaceService,
} from './service';

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await listWorkspacesForUser(ctx.user.id);
  }),

  get: protectedProcedure
    .input(slugSchema.transform((slug) => ({ slug })))
    .query(async ({ ctx, input }) => {
      const found = await getWorkspaceMembership(input.slug, ctx.user.id);
      if (!found) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return { ...found.workspace, role: found.member.role };
    }),

  create: protectedProcedure.input(createWorkspaceSchema).mutation(async ({ ctx, input }) => {
    try {
      return await createWorkspaceWithTemplate(input, {
        ownerUserId: ctx.user.id,
        ownerName: ctx.user.name ?? ctx.user.email,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create workspace';
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    }
  }),

  update: ownerProcedure
    .input(updateWorkspaceSchema.omit({ slug: true }))
    .mutation(async ({ ctx, input }) => {
      return await updateWorkspaceService(
        ctx.workspace.id,
        {
          name: input.name,
          slug: input.newSlug,
          displayCurrency: input.displayCurrency,
        },
        ctx.user.id,
      );
    }),

  delete: ownerProcedure
    .input(deleteWorkspaceSchema.omit({ slug: true }))
    .mutation(async ({ ctx, input }) => {
      if (input.confirm !== ctx.workspace.name) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Confirmation does not match workspace name',
        });
      }
      return await deleteWorkspaceService(ctx.workspace.id, ctx.user.id);
    }),

  membership: workspaceProcedure.query(({ ctx }) => {
    return {
      workspace: ctx.workspace,
      role: ctx.role,
      memberId: ctx.member.id,
    };
  }),
});
