import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '@/src/server/router';

export const trpc = createTRPCReact<AppRouter>();
