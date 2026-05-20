import { index, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { user } from '@/src/features/auth/server/db';
import { workspaces } from '@/src/features/workspace/server/db';

export const shareScopeEnum = pgEnum('share_scope', ['workspace', 'asset']);
export const sharePermissionEnum = pgEnum('share_permission', ['view']);

export const publicShares = pgTable(
  'public_shares',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    scope: shareScopeEnum('scope').notNull(),
    targetId: text('target_id').notNull(),
    token: text('token').notNull().unique(),
    permission: sharePermissionEnum('permission').notNull().default('view'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uniq_share_token').on(table.token),
    index('idx_shares_workspace').on(table.workspaceId),
  ],
);
