import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { workspaces } from '@/src/features/workspace/server/db';

export const fieldTypeEnum = pgEnum('field_type', [
  'text',
  'number',
  'date',
  'select',
  'multi_select',
  'boolean',
  'url',
  'currency',
]);

export const categories = pgTable(
  'categories',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    icon: text('icon'),
    color: text('color'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uniq_category_workspace_name').on(table.workspaceId, table.name),
    index('idx_categories_workspace').on(table.workspaceId),
  ],
);

export const categoryFields = pgTable(
  'category_fields',
  {
    id: text('id').primaryKey(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    label: text('label').notNull(),
    type: fieldTypeEnum('type').notNull(),
    required: boolean('required').notNull().default(false),
    options: jsonb('options'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uniq_field_category_key').on(table.categoryId, table.key),
    index('idx_fields_category').on(table.categoryId),
  ],
);
