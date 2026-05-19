import 'server-only';

import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';

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

// workspaceProcedure / editorProcedure / ownerProcedure will be added when the
// workspace feature is built in Phase 1. They will accept a workspaceSlug input,
// resolve membership, and inject { workspace, member, role } into the context.

export const appRouter = router({
  // Root router. Feature sub-routers are merged here as they are built in
  // Phase 1+. Example:
  //   workspace: workspaceRouter,
  //   asset: assetRouter,
});

export type AppRouter = typeof appRouter;
