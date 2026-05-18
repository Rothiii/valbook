# Phase 0 — Foundation Checklist

# Collaborative Asset Workspace Platform

Version: 0.1
Source: [tech-stack.md](tech-stack.md) section 15
Target window: **Week 1–2** (10 working days)

---

## Overview

Phase 0 = setup tanpa fitur user-facing. Output: skeleton project ready untuk Phase 1 development. Akhir Phase 0 = user dapat register, login, create workspace dari template, lihat empty dashboard.

---

## Pre-flight (Day 0)

Setup akun sebelum mulai code:

- [ ] **GitHub repo** — create private repo `asset-workspace`
- [ ] **Vercel account** — connect ke GitHub
- [ ] **Neon account** — create project `asset-workspace`, get connection string (prod + dev branch)
- [ ] **Cloudflare R2** — create account, create bucket `asset-workspace-dev` + `asset-workspace-prod`, generate API token
- [ ] **Resend account** — generate API key, plan domain verification
- [ ] **Upstash account** — create Redis DB `asset-workspace`
- [ ] **Sentry account** — create project `asset-workspace-web`, get DSN
- [ ] **Domain** (opsional Phase 0) — punya domain untuk email + Vercel custom domain
- [ ] **Local env** — Node 22 LTS installed, pnpm 9+ installed

---

## Step 1: Repo + pnpm workspace

**Goal**: monorepo struktur siap dengan pnpm.

```bash
mkdir asset-workspace && cd asset-workspace
pnpm init
mkdir apps && cd apps
```

**Files**:
- `pnpm-workspace.yaml`: list packages folder
- `package.json` (root): minimal scripts
- `.gitignore`: node_modules, .next, .env, drizzle/migrations/*.sql temp
- `.npmrc`: `auto-install-peers=true`

**Acceptance**:
- [ ] `pnpm install` jalan tanpa error
- [ ] Folder struktur: `apps/web/`, `pnpm-workspace.yaml` ada
- [ ] Git initialized, `.gitignore` proper

**Est**: 30 min

---

## Step 2: Next.js 15 + TypeScript

**Goal**: Next.js app router siap.

```bash
cd apps && pnpm create next-app@latest web --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Adjust setelah:
- Pindahkan `app/`, `public/` ke struktur final
- Buat `src/` folder dan adjust paths

**Files**:
- `apps/web/tsconfig.json` — strict mode true
- `apps/web/next.config.ts` — typed routes enabled, experimental.reactCompiler

**Acceptance**:
- [ ] `pnpm dev` jalan, akses localhost:3000 tampil default page
- [ ] `pnpm build` sukses
- [ ] TypeScript strict mode aktif (`strict: true`)
- [ ] Typed routes aktif

**Est**: 1 hour

---

## Step 3: Biome + lefthook

**Goal**: linter + formatter + git hooks.

```bash
pnpm add -D -w @biomejs/biome lefthook
pnpm biome init
pnpm lefthook install
```

**Files**:
- `biome.json` — TypeScript + React preset, 2-space indent, single quote
- `lefthook.yml` — pre-commit: biome check + tsc

**Acceptance**:
- [ ] `pnpm biome check .` jalan tanpa error
- [ ] Git commit memicu pre-commit hook
- [ ] `pnpm biome format --write .` formatting bekerja
- [ ] Hapus ESLint dari Next.js default (uninstall + remove config)

**Est**: 1 hour

---

## Step 4: Tailwind v4 + shadcn/ui

**Goal**: styling system + component primitives.

```bash
cd apps/web
pnpm dlx shadcn@canary init
pnpm dlx shadcn@canary add button card input label form
```

**Files**:
- `apps/web/src/components/ui/` — shadcn components
- `apps/web/src/lib/utils.ts` — cn helper
- `apps/web/app/globals.css` — Tailwind v4 + CSS vars

**Acceptance**:
- [ ] Tampil Button shadcn di home page test
- [ ] Dark mode toggle bekerja (CSS variable + class strategy)
- [ ] `cn()` utility tersedia
- [ ] Tailwind v4 + PostCSS config benar

**Est**: 2 hours

---

## Step 5: Drizzle + Neon

**Goal**: ORM + database connection.

```bash
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit
```

**Files**:
- `apps/web/src/server/db/index.ts` — Neon HTTP client + Drizzle init
- `apps/web/src/server/db/schema/` — folder untuk schema files
- `apps/web/drizzle.config.ts` — drizzle-kit config
- `apps/web/.env.local` — DATABASE_URL

**Schema files** (sesuai ERD section 2):
- `apps/web/src/server/db/schema/auth.ts` — better-auth tables (later)
- `apps/web/src/server/db/schema/workspace.ts` — workspaces, members, invitations
- `apps/web/src/server/db/schema/taxonomy.ts` — categories, fields, owner_labels, tags
- `apps/web/src/server/db/schema/asset.ts` — assets, asset_tags
- `apps/web/src/server/db/schema/valuation.ts` — valuation_history
- `apps/web/src/server/db/schema/transaction.ts` — transactions (V2, schema definition tetap)
- `apps/web/src/server/db/schema/attachment.ts` — attachments
- `apps/web/src/server/db/schema/activity.ts` — activity_logs
- `apps/web/src/server/db/schema/share.ts` — public_shares
- `apps/web/src/server/db/schema/currency.ts` — currencies, exchange_rates
- `apps/web/src/server/db/schema/template.ts` — workspace_templates
- `apps/web/src/server/db/schema/index.ts` — re-export all

**Acceptance**:
- [ ] `pnpm drizzle-kit generate` produces migration file
- [ ] `pnpm drizzle-kit push` apply to Neon dev branch sukses
- [ ] Connect via `select 1` test query sukses
- [ ] All FK constraints aktif
- [ ] Indexes section 5 ERD created (manual SQL kalau perlu)
- [ ] GIN index custom_fields, name trigram aktif

**Est**: 1 day (8 hours) — paling berat karena translate ERD ke Drizzle schema

---

## Step 6: better-auth

**Goal**: auth integration.

```bash
pnpm add better-auth
```

**Files**:
- `apps/web/src/server/auth/index.ts` — better-auth config
- `apps/web/app/api/auth/[...all]/route.ts` — handler
- `apps/web/src/lib/auth-client.ts` — client SDK

**Config**:
- Database adapter: Drizzle
- Email + password provider aktif
- Email verification required
- Session strategy: database
- Additional fields user: `name`, `avatar_url`

**Acceptance**:
- [ ] `pnpm drizzle-kit push` apply better-auth tables (user, session, account, verification)
- [ ] Register endpoint return user
- [ ] Login + session cookie set
- [ ] Email verification token generated (skip send dulu sampai step 11)
- [ ] Session callback inject user.id ke context

**Est**: 4 hours

---

## Step 7: tRPC v11 boilerplate

**Goal**: type-safe RPC.

```bash
pnpm add @trpc/server @trpc/client @trpc/react-query @tanstack/react-query
pnpm add superjson zod
```

**Files**:
- `apps/web/src/server/trpc.ts` — context + middleware (`protectedProcedure`, `workspaceProcedure`, `editorProcedure`, `ownerProcedure`)
- `apps/web/src/server/routers/index.ts` — root router (empty)
- `apps/web/app/api/trpc/[trpc]/route.ts` — handler
- `apps/web/src/lib/trpc-client.ts` — React Query client
- `apps/web/src/lib/trpc-provider.tsx` — provider

**Middleware** (per permission-matrix section 5.1):
- `protectedProcedure` — require session
- `workspaceProcedure(slug)` — inject `{ workspace, member, role }`
- `editorProcedure` — role >= editor
- `ownerProcedure` — role === owner

**Acceptance**:
- [ ] Sample query (`hello.world`) callable dari client
- [ ] Error formatting custom shaper bekerja
- [ ] Session injected ke context
- [ ] `workspaceProcedure` reject kalau non-member

**Est**: 4 hours

---

## Step 8: Zod schema folder

**Goal**: shared validation.

**Files**:
- `apps/web/src/lib/schema/workspace.ts`
- `apps/web/src/lib/schema/asset.ts`
- `apps/web/src/lib/schema/category.ts`
- `apps/web/src/lib/schema/valuation.ts`
- `apps/web/src/lib/schema/common.ts` — currency, id, slug helpers
- `apps/web/src/lib/schema/index.ts` — re-export

**Acceptance**:
- [ ] Each entity punya `create*Schema`, `update*Schema`
- [ ] Schema sharable client + server (no server-only deps)
- [ ] Custom error messages bahasa Indonesia (atau later i18n)

**Est**: 3 hours

---

## Step 9: R2 client

**Goal**: object storage signed URL.

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Files**:
- `apps/web/src/lib/r2.ts` — S3-compat client + helper

**Functions**:
- `getUploadUrl({ key, contentType, sizeBytes })` — return presigned PUT URL (10 min expiry)
- `getDownloadUrl({ key })` — return presigned GET URL (5 min expiry)
- `deleteObject({ key })`

**Acceptance**:
- [ ] Generate upload URL test bekerja
- [ ] PUT file via curl sukses
- [ ] GET via signed URL sukses, expire 5 min later
- [ ] Bucket policy private (no public access)

**Est**: 3 hours

---

## Step 10: Resend + React Email

**Goal**: email send setup.

```bash
pnpm add resend
pnpm add -D @react-email/components @react-email/render
```

**Files**:
- `apps/web/src/lib/email.ts` — Resend client + send helper
- `apps/web/src/emails/verify-email.tsx` — template
- `apps/web/src/emails/invitation.tsx` — template
- `apps/web/src/emails/password-reset.tsx` — template

**Acceptance**:
- [ ] Send test email ke email diri sendiri sukses
- [ ] Template render HTML benar (preview di dev mode)
- [ ] Domain verification + DKIM setup di Resend dashboard
- [ ] Connect ke better-auth email hook (verify + reset)

**Est**: 4 hours

---

## Step 11: Upstash Redis

**Goal**: rate limit + cache.

```bash
pnpm add @upstash/redis @upstash/ratelimit
```

**Files**:
- `apps/web/src/lib/redis.ts` — Upstash client
- `apps/web/src/lib/rate-limit.ts` — ratelimit configs per endpoint (sesuai api-design section 8)
- `apps/web/src/lib/cache.ts` — cache helper (get/set/invalidate)

**Rate limit configs**:
- signUp: 5/hour/IP
- signIn: 10/15min/IP
- shareCreate: 10/hour/workspace
- inviteMember: 50/hour/workspace
- attachmentUpload: 100/hour/user
- valuationBulkImport: 5/hour/workspace
- publicShareView: 100/min/IP
- default: 1000/15min/user

**Acceptance**:
- [ ] Rate limit middleware bekerja di tRPC + REST
- [ ] Cache hit/miss tracked
- [ ] Redis connection sukses dari serverless

**Est**: 3 hours

---

## Step 12: Sentry SDK

**Goal**: error monitoring.

```bash
pnpm dlx @sentry/wizard@latest -i nextjs
```

**Files**:
- `apps/web/sentry.client.config.ts`
- `apps/web/sentry.server.config.ts`
- `apps/web/sentry.edge.config.ts`
- `apps/web/instrumentation.ts`

**Config**:
- Sampling: 100% error, 10% transactions
- Source map upload di CI (auth token via env)
- Release tracking dari git SHA

**Acceptance**:
- [ ] Test exception capture muncul di Sentry dashboard
- [ ] Source map upload bekerja di production build
- [ ] Performance trace tampil

**Est**: 2 hours

---

## Step 13: Vercel project + env

**Goal**: deploy preview.

- [ ] Create Vercel project, connect repo
- [ ] Set root dir: `apps/web`
- [ ] Set build command: `cd ../.. && pnpm install && pnpm --filter web build`
- [ ] Add all env vars dari tech-stack.md section 6
- [ ] Setup Neon branch creation pada preview deploy
- [ ] Connect domain (kalau ada)

**Acceptance**:
- [ ] Push ke main → deploy sukses
- [ ] PR → preview deploy sukses
- [ ] Env var aktif di production
- [ ] Vercel Analytics aktif

**Est**: 2 hours

---

## Step 14: GitHub Actions CI

**Goal**: pre-merge gates.

**Files**:
- `.github/workflows/ci.yml`

**Steps**:
1. Checkout
2. Setup Node 22 + pnpm
3. Install (cache)
4. Biome check
5. tsc --noEmit
6. Vitest run
7. Build

**Acceptance**:
- [ ] CI jalan di PR
- [ ] All checks green sebelum merge
- [ ] Cache hit rate >80% setelah first run

**Est**: 2 hours

---

## Step 15: Seed data

**Goal**: bootstrap currencies + templates.

**Files**:
- `apps/web/src/server/db/seed/index.ts`
- `apps/web/src/server/db/seed/currencies.ts` — IDR, USD, EUR, JPY, SGD, BTC, ETH, USDT, dll
- `apps/web/src/server/db/seed/templates.ts` — 6 builtin templates per ERD 2.19

**Script**:
- `pnpm db:seed` — populate DB

**Templates**:
- Blank
- Personal Wealth — Tabungan, Saham, Crypto, Emas, Property
- Family Asset — Rumah, Kendaraan, Elektronik, Furniture, Koleksi
- Office Equipment — Laptop, Monitor, Peripheral, Furniture, Lisensi Software
- Real Estate — Tanah, Rumah, Apartemen, Ruko
- Crypto Portfolio — Bitcoin, Ethereum, Altcoin, Stablecoin

Each template's `definition` jsonb includes `categories[]` dengan `fields[]` sesuai use case.

**Acceptance**:
- [ ] Run `pnpm db:seed` populate 9+ currencies, 6 templates
- [ ] Templates definition valid JSON
- [ ] Idempotent (run dua kali tidak duplicate)

**Est**: 4 hours

---

## Step 16: Initial cron job

**Goal**: rate refresh skeleton.

**Files**:
- `apps/web/app/api/webhooks/cron/rate-refresh/route.ts`
- `apps/web/vercel.json` — cron config

**Logic**:
- Verify `X-Cron-Secret` header
- Fetch fiat dari frankfurter.app
- Fetch crypto dari CoinGecko
- Upsert ke `exchange_rates` dengan `valid_from = now()`, `source = 'api'`

**Acceptance**:
- [ ] Schedule registered di vercel.json (`*/6 * * * *` adjust ke 6h)
- [ ] Manual trigger via cron secret sukses
- [ ] Rates appear di DB

**Est**: 3 hours

---

## Step 17: First E2E flow

**Goal**: register → create workspace → see empty dashboard.

**Stories implemented**: AUTH-01, AUTH-02, AUTH-04, WS-01, WS-02

**Pages**:
- `/register` — form
- `/login` — form
- `/verify-email/:token`
- `/onboarding` — template picker (after verify)
- `/app` — workspace list / switcher
- `/app/w/:slug` — empty dashboard with CTAs

**API**:
- better-auth handlers
- `workspaces.create` (with template materialize)
- `workspaces.list`
- `workspaces.get`

**Acceptance**:
- [ ] Register → email link → verify → onboarding
- [ ] Pick template (e.g. Family Asset) + name → submit
- [ ] Workspace created with categories + fields materialized
- [ ] Redirect to empty dashboard
- [ ] Activity log entry `workspace.create` dibuat
- [ ] Mobile + desktop layout responsif

**Est**: 2 days (16 hours)

---

## Daily Budget

| Day | Steps | Total est |
|---|---|---|
| Day 1 | 1, 2, 3 | 2.5 hours |
| Day 2 | 4, 5 (partial) | 8 hours |
| Day 3 | 5 (finish) | 8 hours |
| Day 4 | 6, 7 | 8 hours |
| Day 5 | 8, 9 | 6 hours |
| Day 6 | 10, 11 | 7 hours |
| Day 7 | 12, 13, 14 | 6 hours |
| Day 8 | 15, 16 | 7 hours |
| Day 9 | 17 (start) | 8 hours |
| Day 10 | 17 (finish + buffer) | 8 hours |

**Total**: ~70 hours = 10 working days = **2 minggu**.

Buffer untuk debugging + unexpected: built into Day 10.

---

## Definition of Done — Phase 0

Phase 0 selesai ketika:

- [ ] All 17 steps acceptance criteria centang
- [ ] User dapat register + verify email + login
- [ ] User dapat create workspace dari template
- [ ] Empty workspace dashboard load di desktop + mobile
- [ ] CI/CD green untuk PR + main
- [ ] Sentry capture exception
- [ ] Rate limit aktif untuk auth endpoints
- [ ] R2 upload+download bekerja (verified manual)
- [ ] Cron rate refresh schedule visible
- [ ] Tidak ada TODO P0 blocker untuk Phase 1

---

## Out of Scope — Phase 0

Jangan implementasi di Phase 0 (defer ke phase berikut):

- Asset CRUD (Phase 1)
- Category management UI (Phase 1)
- Member invitation flow lengkap (Phase 2)
- Public sharing (Phase 5)
- Dashboard data viz (Phase 3)
- Attachment upload UI (Phase 4)
- Activity log UI (Phase 4)

Yang penting: infrastructure + first slice end-to-end. Sisanya Phase berikut.

---

## Risk & Blockers

| Risk | Mitigation |
|---|---|
| Neon connection pooling issue di Vercel edge | Pakai HTTP driver `@neondatabase/serverless`, bukan TCP |
| better-auth Drizzle adapter quirk | Pin version, baca release notes, test register flow awal |
| R2 CORS untuk direct upload | Set CORS origin di R2 settings sebelum step 9 |
| Resend domain verification lambat | Setup DNS lebih awal di Day 1 |
| Drizzle migration drift | Selalu `generate` + commit migration file, jangan modify post-apply |
| Vercel build time | Cache pnpm store + Next.js cache enabled |

---

## Changelog

- 0.1 — Initial Phase 0 checklist. 17 steps, 10-day plan, acceptance per step, risk register.
