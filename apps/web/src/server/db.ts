import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Schema aggregator: re-export all feature tables here as they are built.
// Each feature owns its schema in src/features/<feature>/server/db.ts and is
// imported here so drizzle-kit can generate the full migration.
//
// Example (will be added in Phase 1+):
//   import * as workspaceSchema from '@/src/features/workspace/server/db';
//   import * as assetSchema from '@/src/features/asset/server/db';
//   const schema = { ...workspaceSchema, ...assetSchema };

const schema = {};

// Fallback URL keeps Next.js build-time static collection happy when env is
// not loaded. Real DATABASE_URL must be set in .env.local / Vercel env for
// runtime queries to succeed.
const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

// `postgres-js` works against local Docker Postgres, Neon (via standard URL),
// Supabase, RDS, and any standard Postgres. For Vercel Edge runtime, swap to
// `@neondatabase/serverless` with neon-http driver — handled by a build flag
// when wiring time comes.
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
  prepare: false,
});

export const db = drizzle(client, { schema, casing: 'snake_case' });

export type Database = typeof db;
export { schema };
