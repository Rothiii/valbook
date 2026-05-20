import { workspaceRouter } from '@/src/features/workspace/server/router';

import { router } from './trpc';

export const appRouter = router({
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
