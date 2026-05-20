import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { and, eq } from 'drizzle-orm';
import superjson from 'superjson';
import { ZodError, z } from 'zod';

import { workspaceMembers, workspaces } from '@/src/features/workspace/server/db';
import { slugSchema } from '@/src/shared/types/common';

import { auth } from './auth';
import { db } from './db';

export async function createContext(opts: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({ headers: opts.req.headers });
  return {
    db,
    headers: opts.req.headers,
    session: session?.session ?? null,
    user: session?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
          ? error.cause.flatten()
          : null,
    },
  }),
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});

const workspaceSlugInput = z.object({ workspaceSlug: slugSchema });

/**
 * workspaceProcedure injects { workspace, member, role } when the session user
 * is a member of the workspace identified by `workspaceSlug` input. Use this
 * for any procedure scoped to a single workspace.
 */
export const workspaceProcedure = protectedProcedure
  .input(workspaceSlugInput)
  .use(async ({ ctx, input, next }) => {
    const row = await ctx.db
      .select({
        workspace: workspaces,
        member: workspaceMembers,
      })
      .from(workspaces)
      .innerJoin(
        workspaceMembers,
        and(
          eq(workspaceMembers.workspaceId, workspaces.id),
          eq(workspaceMembers.userId, ctx.user.id),
        ),
      )
      .where(eq(workspaces.slug, input.workspaceSlug))
      .limit(1);

    const found = row[0];
    if (!found) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this workspace' });
    }

    return next({
      ctx: {
        ...ctx,
        workspace: found.workspace,
        member: found.member,
        role: found.member.role,
      },
    });
  });

/** Require role >= editor (editor or owner). */
export const editorProcedure = workspaceProcedure.use(({ ctx, next }) => {
  if (ctx.role !== 'owner' && ctx.role !== 'editor') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Editor role required' });
  }
  return next({ ctx });
});

/** Require role === owner. */
export const ownerProcedure = workspaceProcedure.use(({ ctx, next }) => {
  if (ctx.role !== 'owner') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Owner role required' });
  }
  return next({ ctx });
});

// Root router and AppRouter type are defined in src/server/router.ts to
// avoid a circular import between trpc.ts (procedures) and feature routers
// that consume those procedures.
