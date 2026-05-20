import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { workspaces } from '@/src/features/workspace/server/db';

export const ownerLabels = pgTable(
  'owner_labels',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_owners_workspace').on(table.workspaceId)],
);
