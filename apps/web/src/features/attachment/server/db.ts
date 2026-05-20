import { bigint, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { assets } from '@/src/features/asset/server/db';
import { user } from '@/src/features/auth/server/db';
import { workspaces } from '@/src/features/workspace/server/db';

export const attachments = pgTable(
  'attachments',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    assetId: text('asset_id').references(() => assets.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_attachments_workspace').on(table.workspaceId),
    index('idx_attachments_asset').on(table.assetId),
  ],
);
