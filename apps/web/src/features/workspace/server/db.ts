import { sql } from 'drizzle-orm';
import {
  boolean,
  char,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { user } from '@/src/features/auth/server/db';

export const workspaceRoleEnum = pgEnum('workspace_role', ['owner', 'editor', 'viewer']);
export const invitationRoleEnum = pgEnum('invitation_role', ['editor', 'viewer']);

export const workspaces = pgTable(
  'workspaces',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    settings: jsonb('settings').notNull().default(sql`'{}'::jsonb`),
    displayCurrency: char('display_currency', { length: 3 }).notNull().default('IDR'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_workspaces_owner').on(table.ownerId)],
);

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: workspaceRoleEnum('role').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uniq_workspace_member').on(table.workspaceId, table.userId),
    index('idx_workspace_members_user').on(table.userId),
  ],
);

export const workspaceInvitations = pgTable(
  'workspace_invitations',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: invitationRoleEnum('role').notNull(),
    token: text('token').notNull().unique(),
    invitedBy: text('invited_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uniq_invitation_token').on(table.token),
    index('idx_workspace_invitations_workspace').on(table.workspaceId),
  ],
);

export const workspaceTemplates = pgTable('workspace_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  isBuiltin: boolean('is_builtin').notNull().default(false),
  definition: jsonb('definition').notNull(),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
