import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as activitySchema from '@/src/features/activity/server/db';
import * as assetSchema from '@/src/features/asset/server/db';
import * as attachmentSchema from '@/src/features/attachment/server/db';
import * as authSchema from '@/src/features/auth/server/db';
import * as categorySchema from '@/src/features/category/server/db';
import * as currencySchema from '@/src/features/currency/server/db';
import * as ownerLabelSchema from '@/src/features/owner-label/server/db';
import * as sharingSchema from '@/src/features/sharing/server/db';
import * as tagSchema from '@/src/features/tag/server/db';
import * as valuationSchema from '@/src/features/valuation/server/db';
import * as workspaceSchema from '@/src/features/workspace/server/db';

// Aggregated Drizzle schema. Every feature table is re-exported here so
// drizzle-kit can read a single entry point for generate/push/migrate.
export const schema = {
  ...authSchema,
  ...workspaceSchema,
  ...categorySchema,
  ...ownerLabelSchema,
  ...tagSchema,
  ...assetSchema,
  ...valuationSchema,
  ...attachmentSchema,
  ...activitySchema,
  ...sharingSchema,
  ...currencySchema,
};

// Fallback URL keeps Next.js build-time static collection happy when env is
// not loaded. Real DATABASE_URL must be set in .env.local / Vercel env for
// runtime queries to succeed.
const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
  prepare: false,
});

export const db = drizzle(client, { schema, casing: 'snake_case' });

export type Database = typeof db;
