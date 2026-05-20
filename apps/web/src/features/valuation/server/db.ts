import { sql } from 'drizzle-orm';
import { char, index, jsonb, numeric, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { assets } from '@/src/features/asset/server/db';
import { user } from '@/src/features/auth/server/db';

export const valuationSourceEnum = pgEnum('valuation_source', ['manual', 'import', 'market']);

export const valuationHistory = pgTable(
  'valuation_history',
  {
    id: text('id').primaryKey(),
    assetId: text('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    value: numeric('value', { precision: 20, scale: 8 }).notNull(),
    currency: char('currency', { length: 3 }).notNull(),
    valuedAt: timestamp('valued_at', { withTimezone: true }).notNull(),
    source: valuationSourceEnum('source').notNull().default('manual'),
    note: text('note'),
    customFields: jsonb('custom_fields').notNull().default(sql`'{}'::jsonb`),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_valuation_asset_time').on(table.assetId, table.valuedAt)],
);
