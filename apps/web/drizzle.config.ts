import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local');
}

export default defineConfig({
  // Glob picks up every feature db.ts so drizzle-kit sees direct pgTable
  // exports (it inspects exported tables, spread re-exports do not count).
  schema: './src/features/**/server/db.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  casing: 'snake_case',
});
