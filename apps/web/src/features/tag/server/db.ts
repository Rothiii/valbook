import { index, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { workspaces } from '@/src/features/workspace/server/db';

export const tags = pgTable(
  'tags',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uniq_tag_workspace_name').on(table.workspaceId, table.name),
    index('idx_tags_workspace').on(table.workspaceId),
  ],
);

// asset_tags pivot defined here (tag side); circular ref to assets handled via
// FK at apply-time. Drizzle resolves forward refs through string column names.
export const assetTags = pgTable(
  'asset_tags',
  {
    assetId: text('asset_id').notNull(),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.assetId, table.tagId] })],
);
