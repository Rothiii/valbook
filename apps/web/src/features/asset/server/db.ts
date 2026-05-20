import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  char,
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { user } from '@/src/features/auth/server/db';
import { categories } from '@/src/features/category/server/db';
import { ownerLabels } from '@/src/features/owner-label/server/db';
import { workspaces } from '@/src/features/workspace/server/db';

export const assetStatusEnum = pgEnum('asset_status', [
  'active',
  'archived',
  'sold',
  'lost',
  'disposed',
]);

export const assets = pgTable(
  'assets',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    parentAssetId: text('parent_asset_id').references((): AnyPgColumn => assets.id, {
      onDelete: 'set null',
    }),
    categoryId: text('category_id').references(() => categories.id, { onDelete: 'restrict' }),
    ownerLabelId: text('owner_label_id').references(() => ownerLabels.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    code: text('code'),
    status: assetStatusEnum('status').notNull().default('active'),
    location: text('location'),
    notes: text('notes'),
    purchasePrice: numeric('purchase_price', { precision: 20, scale: 8 }),
    purchaseCurrency: char('purchase_currency', { length: 3 }),
    purchaseDate: timestamp('purchase_date', { withTimezone: true, mode: 'date' }),
    currentValue: numeric('current_value', { precision: 20, scale: 8 }),
    currentCurrency: char('current_currency', { length: 3 }),
    currentValueUpdatedAt: timestamp('current_value_updated_at', { withTimezone: true }),
    customFields: jsonb('custom_fields').notNull().default(sql`'{}'::jsonb`),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_assets_workspace_status').on(table.workspaceId, table.status),
    index('idx_assets_category').on(table.workspaceId, table.categoryId),
    uniqueIndex('uniq_assets_code_per_workspace')
      .on(table.workspaceId, table.code)
      .where(sql`${table.code} IS NOT NULL`),
  ],
);
