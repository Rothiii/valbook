import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { user } from '@/src/features/auth/server/db';
import { workspaces } from '@/src/features/workspace/server/db';

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    entityLabel: text('entity_label'),
    action: text('action').notNull(),
    diff: jsonb('diff'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_activity_workspace').on(table.workspaceId, table.createdAt),
    index('idx_activity_entity').on(table.entityType, table.entityId),
  ],
);
