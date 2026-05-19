import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter, createContext } from '@/src/server/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (opts) => createContext(opts),
    onError({ error, path }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        // biome-ignore lint/suspicious/noConsole: server-side error logging until pino is wired up
        console.error(`tRPC failed at ${path ?? '<no-path>'}:`, error);
      }
    },
  });

export { handler as GET, handler as POST };
