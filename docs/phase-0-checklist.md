# Phase 0 — Foundation Checklist

# Collaborative Asset Workspace Platform

Version: 0.7
Source: [tech-stack.md](tech-stack.md) section 15
Target window: **Week 1–2** (10 working days)

---

## Status Summary

| Step | Status | Note |
|---|---|---|
| Pre-flight | ✅ done | Local-only: DBngin Postgres + Node + pnpm. Akun eksternal (Neon, R2, Resend, Upstash, Sentry, Vercel) ditunda ke Phase 7 |
| 1. Repo + pnpm workspace | ✅ done | |
| 2. Next.js + TS | ✅ done | Next.js 16.2.6 (bukan 15, latest stable saat init) |
| 3. Biome + lefthook | ✅ done | Biome 2.4.15 |
| 4. Tailwind + shadcn/ui | ✅ done | `form` installed; ThemeProvider (next-themes) wired di RootLayout |
| 5. Drizzle + local Postgres | ✅ done | Schema lengkap semua phase. Migration generated + applied via `pnpm db:migrate`. Driver: postgres-js (universal: local + Neon/Supabase di Phase 7) |
| 6. better-auth | ✅ done | Config + Drizzle schema generated. Email verification disabled (autoSignIn aktif); verify badge + resend button di /account |
| 7. tRPC v11 | ✅ done | Root router, middleware base, provider wired |
| 8. Zod schemas | ✅ done | Common types di `shared/types/common.ts`. Per-feature schemas Phase 1+ |
| 9. Storage (local FS) | ✅ done | `public/uploads/` filesystem storage. R2 dipindah ke Phase 7 |
| 10. Email templates | ✅ done | 3 templates + local-mode console log. Resend dipindah ke Phase 7 |
| 11. Cache + rate limit | ✅ done | In-memory Map fallback. Upstash dipindah ke Phase 7 |
| 12. Sentry | ✅ done | Init no-op tanpa DSN. Full wiring dipindah ke Phase 7 |
| 13. Deploy | → Phase 7 | Vercel + domain setup dipindah ke Phase 7 |
| 14. GitHub Actions CI | ✅ done | Lint + typecheck + build green |
| 15. Seed data | ⏳ pending | Butuh DB + workspace_templates schema (Phase 1) |
| 16. Cron job | ✅ stub | Route wired; logic Phase 3 (seed-only), live API Phase 7 |
| 17. First E2E flow | 🟡 UI sliced | Semua Phase 1 page skeleton done; data wiring di Phase 1+ |

Legend: ✅ done · 🟡 scaffolded (butuh credentials atau dependency) · ⏳ pending

---

## Overview

Phase 0 = setup tanpa fitur user-facing. Output: skeleton project ready untuk Phase 1 development. Akhir Phase 0 = user dapat register, login, create workspace dari template, lihat empty dashboard.

---

## Strategy: Local-First, Third-Party Last

MVP (phase 0-6) jalan lokal pakai stack di bawah ini. Semua third-party SaaS (Neon, Cloudflare R2, Resend, Upstash, Sentry, Vercel) ditunda ke [phase-7-checklist.md](phase-7-checklist.md). Phase 7 = swap implementation di balik existing API surface — kode app-level tidak berubah.

| Layer | Local (Phase 0-6) | Production (Phase 7) |
|---|---|---|
| Database | DBngin Postgres 17 @ localhost:5432 via postgres-js | Neon (atau Supabase) |
| File storage | `public/uploads/` filesystem | Cloudflare R2 (presigned URLs) |
| Email | `[email:local-mode]` console log | Resend |
| Cache | In-memory `Map` dengan TTL | Upstash Redis |
| Rate limit | In-memory sliding window | Upstash Ratelimit |
| Error monitoring | Sentry no-op (DSN kosong) | Sentry full sampling |
| Cron | Stub endpoint | Vercel cron `0 */6 * * *` |
| Hosting | `pnpm dev` localhost:3000 | Vercel + custom domain |

---

## Pre-flight (Day 0) — MVP Local

Setup minimal untuk MVP local-only. Lihat [../SETUP.md](../SETUP.md) untuk step-by-step.

- [x] **GitHub repo** — https://github.com/Rothiii/valbook
- [x] **Local env** — Node 22 LTS, pnpm 10
- [x] **Local Postgres** — DBngin Postgres 17 di localhost:5432

**Akun eksternal SaaS → dipindah ke [phase-7-checklist.md](phase-7-checklist.md)**: Vercel, Neon/Supabase, Cloudflare R2, Resend, Upstash, Sentry, domain

---

## Step 1: Repo + pnpm workspace ✅

**Goal**: monorepo struktur siap dengan pnpm.

**Files**:
- `pnpm-workspace.yaml`
- `package.json` (root)
- `.gitignore`
- `.npmrc`

**Acceptance**:
- [x] `pnpm install` jalan tanpa error
- [x] Folder struktur: `apps/web/`, `pnpm-workspace.yaml` ada
- [x] Git initialized, `.gitignore` proper

**Est**: 30 min · **Actual**: done

---

## Step 2: Next.js + TypeScript ✅

**Goal**: Next.js app router siap.

**Catatan**: Next.js 16.2.6 (latest stable saat init) bukan 15 seperti rencana awal. Compatible dengan Tailwind v4 + React Compiler.

**Files**:
- `apps/web/tsconfig.json` — strict mode + noUncheckedIndexedAccess
- `apps/web/next.config.ts` — typed routes + reactCompiler

**Acceptance**:
- [x] `pnpm dev` jalan
- [x] `pnpm build` sukses
- [x] TypeScript strict mode aktif
- [x] Typed routes aktif

**Est**: 1 hour · **Actual**: done

---

## Step 3: Biome + lefthook ✅

**Goal**: linter + formatter + git hooks.

**Files**:
- `biome.json` — Biome 2.4.15 config
- `lefthook.yml` — pre-commit (biome + typecheck), pre-push (test stub)

**Acceptance**:
- [x] `pnpm lint` jalan tanpa error
- [x] Git commit memicu pre-commit hook
- [x] `pnpm format` working
- [x] ESLint removed (replaced by Biome)

**Est**: 1 hour · **Actual**: done

---

## Step 4: Tailwind v4 + shadcn/ui ✅

**Goal**: styling system + component primitives.

**Files**:
- `apps/web/src/shared/ui/` — shadcn components
- `apps/web/src/shared/utils/cn.ts`
- `apps/web/app/globals.css` — monochrome palette + Geist Mono
- `apps/web/components.json` — aliases `@/src/shared/ui` + `@/src/shared/utils/cn`

**Installed components**:
button, card, input, label, dialog, dropdown-menu, badge, table, tabs, sonner, select, textarea, checkbox, separator, skeleton, sheet

**Acceptance**:
- [x] Shadcn Button render di home page
- [x] Tailwind v4 + PostCSS config benar
- [x] `cn()` utility tersedia
- [x] Dark mode CSS variables defined
- [x] `form` component installed (react-hook-form + @hookform/resolvers v3)
- [x] ThemeProvider (next-themes) wired di RootLayout (`shared/lib/theme-provider.tsx`)

**Est**: 2 hours · **Actual**: ~3 hours (palette + monochrome theme)

---

## Step 5: Drizzle + Neon 🟡

**Goal**: ORM + database connection.

**Files**:
- `apps/web/src/server/db.ts` — Neon HTTP client + Drizzle init + schema aggregator
- `apps/web/drizzle.config.ts` — drizzle-kit config
- `apps/web/.env.example` — DATABASE_URL placeholder

**Per-feature DB tables** (akan dibuat Phase 1+):
- `features/auth/server/db.ts` — better-auth-generated tables
- `features/workspace/server/db.ts`
- `features/category/server/db.ts`
- `features/owner-label/server/db.ts`
- `features/tag/server/db.ts`
- `features/asset/server/db.ts`
- `features/valuation/server/db.ts`
- `features/transaction/server/db.ts` (V2)
- `features/attachment/server/db.ts`
- `features/activity/server/db.ts`
- `features/sharing/server/db.ts`
- `features/currency/server/db.ts`

**Acceptance**:
- [x] `drizzle-kit` scripts wired (`db:generate`, `db:push`, `db:migrate`, `db:studio`, `db:check`)
- [x] `src/server/db.ts` aggregator (re-exports 11 feature schemas)
- [x] Driver: postgres-js (works local Docker + Neon + Supabase)
- [x] `drizzle-kit generate` produces migration file (20 tables)
- [x] `drizzle-kit migrate` apply ke DB local sukses
- [x] FK constraints aktif (workspace cascade, user restrict on owner, dll)
- [x] Indexes ERD section 5 created
- [ ] GIN index custom_fields, name trigram → manual SQL Phase 6 polish (Drizzle belum support partial GIN expression elegant)

**Est**: 1 day · **Actual**: scaffold done; full implementation Phase 1+

---

## Step 6: better-auth ✅

**Goal**: auth integration.

**Files**:
- `apps/web/src/server/auth.ts` — better-auth config + Drizzle adapter + email hooks
- `apps/web/app/api/auth/[...all]/route.ts` — handler
- `apps/web/src/shared/lib/auth-client.ts` — client SDK

**Config done**:
- [x] Drizzle adapter dengan `provider: 'pg'`
- [x] Email + password provider aktif
- [x] Email verification required
- [x] Session strategy: database, 7 hari, cookie cache 5 min
- [x] Additional field user: `avatar_url`
- [x] `sendVerificationEmail` + `sendResetPassword` wired ke Resend
- [x] better-auth Drizzle schema generated ke `features/auth/server/db.ts` (user, session, account, verification)
- [x] Migration applied — auth tables live di DB
- [x] Email verification **disabled**: register direct, autoSignIn aktif. Profile menampilkan badge "Unverified" + tombol "Send verification email"

**Acceptance**:
- [x] Config scaffolded + email hooks wired
- [x] `pnpm dlx @better-auth/cli generate` sukses
- [x] `drizzle-kit migrate` apply better-auth tables
- [x] Register endpoint return user via better-auth client (`signUp.email`)
- [x] Login + session cookie set via `signIn.email`
- [x] Verify email kirim manual via tombol di /account (`sendVerificationEmail`)
- [x] Session injected ke tRPC context via `auth.api.getSession`

**Est**: 4 hours · **Actual**: done — verify on-demand pattern menggantikan blocking verify

---

## Step 7: tRPC v11 ✅

**Goal**: type-safe RPC.

**Files**:
- `apps/web/src/server/trpc.ts` — instance + context + middleware base + root router
- `apps/web/app/api/trpc/[trpc]/route.ts` — handler
- `apps/web/src/shared/lib/trpc-client.ts` — React Query client
- `apps/web/src/shared/lib/trpc-provider.tsx` — provider (wired di RootLayout)

**Middleware**:
- [x] `publicProcedure` — no auth
- [x] `protectedProcedure` — require session
- [x] `workspaceProcedure` — input `{ workspaceSlug }`, inject `{ workspace, member, role }` via Drizzle join
- [x] `editorProcedure` — chained on workspaceProcedure, require role >= editor
- [x] `ownerProcedure` — chained on workspaceProcedure, require role === owner

**Acceptance**:
- [x] Error formatting custom shaper bekerja (Zod error inject)
- [x] Session injected ke context
- [x] Build tanpa error
- [x] Root router moved to `src/server/router.ts` (memutus circular import dengan feature router yang konsumsi procedures)
- [x] `workspace.list` callable dari client (sample query selesai)

**Est**: 4 hours · **Actual**: done

---

## Step 8: Zod schemas ✅

**Goal**: shared validation.

**Files**:
- [x] Zod installed
- [x] `apps/web/src/shared/types/common.ts` — id, slug, currencyCode, role, inviteRole, assetStatus, fieldType, numericString, isoDate, cursorPagination + Result helper
- [x] Per-feature `schema.ts` untuk workspace (Phase 1+ menyusul)

**Acceptance**:
- [x] Zod tersedia di client + server
- [x] Common types tersedia di shared/types
- [x] workspace feature punya `create*Schema`, `update*Schema`, `delete*Schema`

**Est**: 2 hours · **Actual**: 30 min (install only)

---

## Step 9: Storage (local FS) ✅

**Goal**: file storage helper untuk MVP, simpan ke `public/uploads/` lokal. Cloudflare R2 dipindah ke [phase-7-checklist.md](phase-7-checklist.md) (Production Wiring).

**Files**:
- `apps/web/src/shared/lib/storage.ts` — local filesystem helper (writeFile/unlink)
- `apps/web/public/uploads/.gitignore` — gitignore semua isi kecuali dirinya sendiri

**Functions**:
- [x] `saveFile({ buffer, contentType, workspaceId, originalName })` → `{ key, url, sizeBytes }`
- [x] `getFileUrl(key)` → `/uploads/<workspace>/<filename>`
- [x] `deleteFile(key)` (guard: refuse delete outside uploads dir)
- [x] Mime allowlist (image, pdf, doc, xls, csv, txt)
- [x] Max file size 25MB

**Acceptance**:
- [x] Helpers exported + typed
- [x] Local file persist di `apps/web/public/uploads/<workspaceId>/<uuid>-<name>`
- [x] URL path serve langsung via Next.js static (`/uploads/...`)
- [ ] **Phase 7**: swap implementation ke R2/S3 (env-gated, same API surface)

**Est**: 3 hours · **Actual**: done

---

## Step 10: Email templates ✅

**Goal**: email render setup. Resend provider dipindah ke [phase-7-checklist.md](phase-7-checklist.md). Local mode: log preview ke console (no-op).

**Files**:
- [x] `apps/web/src/shared/lib/email.ts` — `sendEmail` helper: log preview kalau `RESEND_API_KEY` kosong, lazy-import Resend kalau ada
- [x] `apps/web/src/emails/verify-email.tsx`
- [x] `apps/web/src/emails/invitation.tsx`
- [x] `apps/web/src/emails/password-reset.tsx`

**Acceptance**:
- [x] Template render HTML + plaintext
- [x] Wired ke better-auth email hooks (verify + reset disabled by default; verify on-demand di /account)
- [x] Local mode log `[email:local-mode]` ke console — gak ada error
- [ ] **Phase 7**: Resend API key wired + domain verification + DKIM

**Est**: 4 hours · **Actual**: done

---

## Step 11: Cache + rate limit (in-memory fallback) ✅

**Goal**: cache + rate limit primitives. Upstash Redis dipindah ke [phase-7-checklist.md](phase-7-checklist.md). Local mode: in-memory Map.

**Files**:
- [x] `apps/web/src/shared/lib/redis.ts` — Upstash client kalau env set, kalau enggak `redis = null` + `isUpstashConfigured = false`
- [x] `apps/web/src/shared/lib/rate-limit.ts` — `checkRateLimit(name, identifier)` — sliding window in-memory Map kalau no creds, Upstash Ratelimit kalau ada
- [x] `apps/web/src/shared/lib/cache.ts` — `cacheGet/Set/Invalidate/OrFetch` — Map dengan TTL kalau no creds

**Rate limit configs** (per api-design.md section 8):
- [x] signUp (5/hour/IP), signIn (10/15min/IP)
- [x] shareCreate (10/hour/workspace), inviteMember (50/hour/workspace)
- [x] attachmentUpload (100/hour/user), valuationBulkImport (5/hour/workspace)
- [x] publicShareView (100/min/IP), default (1000/15min/user)

**Acceptance**:
- [x] Configs typed + exported
- [x] Local in-memory mode jalan tanpa Upstash creds — single-process only (cache + rate-limit reset di restart)
- [ ] **Phase 1+**: Rate limit middleware wired di tRPC procedure pertama
- [ ] **Phase 7**: Upstash creds wired untuk multi-instance (Vercel)

**Est**: 3 hours · **Actual**: done

---

## Step 12: Sentry SDK (no-op local) ✅

**Goal**: error monitoring scaffolded. Sentry full wiring dipindah ke [phase-7-checklist.md](phase-7-checklist.md). Local mode: init guarded by DSN, no-op kalau kosong.

**Files**:
- [x] `apps/web/sentry.client.config.ts`
- [x] `apps/web/sentry.server.config.ts`
- [x] `apps/web/sentry.edge.config.ts`
- [x] `apps/web/instrumentation.ts` (with onRequestError export)

**Config**:
- [x] No-op kalau DSN tidak set (dev local quiet)
- [x] Sampling: 10% transactions, 100% errors
- [ ] **Phase 7**: Source map upload di CI (butuh auth token)
- [ ] **Phase 7**: Release tracking dari git SHA

**Acceptance**:
- [x] Init guarded by DSN presence
- [ ] **Phase 7**: test exception capture muncul di dashboard

**Est**: 2 hours · **Actual**: scaffold done

---

## Step 13: Deploy → moved to Phase 7

Vercel project + env + domain setup → [phase-7-checklist.md](phase-7-checklist.md) (Production Wiring).

MVP development jalan lokal: `pnpm dev` di port 3000, DB di DBngin Postgres 17 (`localhost:5432`). Tidak ada deploy preview sampai semua phase 1-6 selesai.

---

## Step 14: GitHub Actions CI ✅

**Goal**: pre-merge gates.

**Files**:
- [x] `.github/workflows/ci.yml`

**Steps**:
1. [x] Checkout
2. [x] Setup Node 22 + pnpm 10
3. [x] Install (cache via pnpm-action-setup)
4. [x] Biome check
5. [x] tsc --noEmit
6. [ ] Vitest run (Phase 1+ saat ada test)
7. [x] Build (dengan placeholder env)

**Acceptance**:
- [x] CI workflow file ada
- [ ] **Verify**: jalan di PR (test setelah push first PR)
- [ ] **Verify**: All checks green
- [ ] **Verify**: Cache hit rate >80%

**Est**: 2 hours · **Actual**: done

---

## Step 15: Seed data ⏳

**Goal**: bootstrap currencies + templates.

**Files** (akan dibuat Phase 1+):
- `apps/web/src/server/seed/index.ts`
- `apps/web/src/server/seed/currencies.ts`
- `apps/web/src/server/seed/templates.ts`

**Templates**:
- Blank
- Personal Wealth
- Family Asset
- Office Equipment
- Real Estate
- Crypto Portfolio

**Acceptance**:
- [ ] **Phase 1**: Run `pnpm db:seed` populate currencies + templates
- [ ] **Phase 1**: Templates definition valid JSON
- [ ] **Phase 1**: Idempotent

**Status**: deferred ke Phase 1 saat workspace_templates schema ready

---

## Step 16: Initial cron job (stub) ✅

**Goal**: cron route skeleton. Scheduler (Vercel cron) + external rate APIs (Frankfurter, CoinGecko) dipindah ke [phase-7-checklist.md](phase-7-checklist.md). Phase 3 implementasi pakai builtin seed rates dulu.

**Files**:
- [x] `apps/web/app/api/webhooks/cron/rate-refresh/route.ts` — stub dengan CRON_SECRET check
- [x] `apps/web/vercel.json` — schedule `0 */6 * * *` (aktif saat deploy)

**Logic**:
- [x] Verify `X-Cron-Secret` header
- [ ] **Phase 3**: load rates dari builtin JSON seed (Frankfurter + CoinGecko fetch ditunda ke Phase 7)
- [ ] **Phase 3**: Upsert ke `exchange_rates`
- [ ] **Phase 7**: Fetch live rates dari frankfurter.app + CoinGecko via cron

**Acceptance**:
- [x] Schedule registered di vercel.json
- [x] Route handler responds dengan secret check
- [ ] **Phase 3**: Seed-only implementation
- [ ] **Phase 7**: Live API fetch

---

## Step 17: First E2E flow 🟡

**Goal**: register → create workspace → see empty dashboard.

**Stories implemented**: AUTH-01, AUTH-02, AUTH-04, WS-01, WS-02

**Pages slicing** (UI skeleton done, wiring pending):
- [x] `/login` — form (AuthCard + Input + Button)
- [x] `/register` — form (name, email, password)
- [x] `/verify-email/[token]` — token preview + continue
- [x] `/forgot-password` — email input + submit
- [x] `/reset-password/[token]` — new password form
- [x] `/onboarding` — template picker (6 builtin cards) + workspace details
- [x] `/app` — workspace list with empty state
- [x] `/app/w/[slug]` — dashboard skeleton (stat cards + chart placeholders + recent activity)

**Bonus slicing** (Phase 1+ pages tapi sudah sliced sekarang):
- [x] `/app/w/[slug]/assets` — list dengan filter bar + table
- [x] `/app/w/[slug]/assets/new` — form (static + dynamic placeholder)
- [x] `/app/w/[slug]/assets/[id]` — detail tabs (overview, valuation, attachments, activity, sub-assets)
- [x] `/app/w/[slug]/categories`, `/owners`, `/tags`, `/members`, `/activity`, `/sharing`, `/settings`
- [x] `/account` — profile, password, sessions, delete
- [x] `/invite/[token]` — accept invitation
- [x] `/public/[token]` — read-only share view (noindex)

**Layouts**:
- [x] `app/(auth)/layout.tsx` — pass-through (AuthCard handles centering)
- [x] `app/app/layout.tsx` — topbar shell
- [x] `app/app/w/[slug]/layout.tsx` — topbar + workspace sidebar

**Shared components** (di `src/shared/ui/`):
- [x] `AuthCard` — centered card untuk auth pages
- [x] `PageHeader` — title + description + actions
- [x] `EmptyState` — icon + title + description + CTA
- [x] `AppTopbar` — logo + workspace switcher + account link
- [x] `WorkspaceSidebar` — 9 nav links per workspace
- [x] `WorkspaceSwitcher` — dropdown dengan list workspace

**API**:
- [x] better-auth handlers wired (DB connected, autoSignIn aktif)
- [x] `workspace.create` (with template materialize) — Phase 1
- [x] `workspace.list` — Phase 1
- [x] `workspace.get` — Phase 1
- [x] `workspace.update` (ownerProcedure) — Phase 1
- [x] `workspace.delete` (ownerProcedure) — Phase 1
- [x] `workspace.membership` — Phase 1

**Acceptance**:
- [x] Semua page render tanpa error
- [x] Build pass + lint clean
- [x] Routing struktur sesuai roadmap
- [x] register → autoSignIn (verify on-demand) — verify badge di /account
- [ ] **Wiring (UI binding)**: Onboarding form pick template + name → submit → `workspace.create` mutation
- [ ] **Wiring (UI binding)**: `/app` workspace list → `workspace.list` query
- [ ] **Wiring**: Activity log entry tertulis ke DB saat workspace dibuat (service sudah insert; perlu test E2E)
- [ ] Mobile + desktop responsive audit (Phase 6 polish)

**Est**: 2 days · **Status**: 🟡 slicing UI + backend procedures done. UI bind ke tRPC mutation/query menyusul.

---

## Daily Budget

| Day | Steps | Status |
|---|---|---|
| Day 1 | 1, 2, 3 | ✅ done |
| Day 2 | 4, 5 | ✅ done |
| Day 3 | 6, 7 | ✅ done (verify on-demand, root router split) |
| Day 4 | 8, 9 | ✅ done (common types + local FS storage) |
| Day 5 | 10, 11 | ✅ done (email console log + in-memory cache/rate-limit) |
| Day 6 | 12, 14 | ✅ done (Sentry no-op, CI green) |
| Day 7 | 13 (Vercel) | → Phase 7 |
| Day 8 | 15, 16 | 🟡 16 stub done, 15 deferred ke Phase 1 |
| Day 9 | 17 (start) | 🟡 slicing UI |
| Day 10 | 17 (finish + buffer) | 🟡 UI bind ke tRPC menyusul |

---

## Definition of Done — Phase 0

- [x] Phase 0 step 1-12, 14, 16 done dengan local-only fallback (no external creds required)
- [x] Step 17 UI slicing done (22 routes + 3 layouts + 6 shared components)
- [x] Step 5 DB live di local Postgres
- [x] Step 6 register + login + session via better-auth (autoSignIn, verify on-demand)
- [x] Step 9 storage local FS (`public/uploads/`)
- [x] Step 10 email log ke console (Resend ditunda Phase 7)
- [x] Step 11 cache + rate-limit in-memory
- [x] Step 12 Sentry no-op
- [ ] Step 15 seed data jalan (Phase 1)
- [ ] Step 17 wiring: register → create workspace → empty dashboard E2E (Phase 1)
- [ ] Step 13 + 16 live API + deploy → Phase 7
- [ ] Tidak ada TODO P0 blocker untuk Phase 1

---

## Risk & Blockers

| Risk | Mitigation | Status |
|---|---|---|
| Postgres connection pool exhaustion di Vercel edge | Driver `postgres-js` dengan pool size; switch ke Neon HTTP driver di Phase 7 | ✅ implemented |
| better-auth Drizzle adapter quirk | Pin version, test register flow awal | ⏳ test pending |
| In-memory cache + rate-limit hilang di restart | Local single-process OK; Phase 7 swap ke Upstash untuk multi-instance | ✅ documented |
| Local FS storage hilang di redeploy | Phase 7 swap ke R2; local-only sampai Phase 7 ready | ✅ documented |
| Email console log gak terlihat user | Phase 7 wire Resend; verify on-demand sudah disabled blocker | ✅ documented |
| Drizzle migration drift | Selalu `generate` + commit migration file | ✅ workflow ready |
| Phase 7 vendor lock-in | API surface (`saveFile`, `cacheGet`, `checkRateLimit`, `sendEmail`) tidak berubah saat swap impl | ✅ designed |

---

## Changelog

- 0.7 — **Local-first refactor**. Semua third-party SaaS (Cloudflare R2, Resend, Upstash, Sentry, Vercel, Neon, Frankfurter, CoinGecko) dipindah ke baru [phase-7-checklist.md](phase-7-checklist.md). Step 9 R2 swap → local FS (`public/uploads/`) via `shared/lib/storage.ts`. Step 10 Resend → console log (`[email:local-mode]`) saat `RESEND_API_KEY` kosong, lazy-import provider kalau ada. Step 11 Upstash → in-memory `Map` + sliding window untuk cache + rate-limit; Upstash kena pakai kalau `UPSTASH_REDIS_REST_URL` set. Step 13 Vercel dipindah seluruhnya ke Phase 7. Step 16 cron stub tetap; live API fetch ditunda. `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` di-drop dari deps. Duplicate `shared/lib/auth-client.ts` dihapus (yang asli di `features/auth/auth-client.ts`). Pre-flight section sekarang local-only. Step 4, 9-12 marked done.
- 0.6 — Backend wiring landed: workspace tRPC router (list/get/create/update/delete/membership) + service layer (template materialize, activity log). Better-auth client SDK menggantikan zustand auth mock (register/login/logout/verify/forgot-password/reset-password/updateProfile semua via `authClient`). Email verification disabled — register langsung sign-in (autoSignIn). `/account` menampilkan `EmailVerificationCard` (badge Verified/Unverified + tombol Send verification email). Common Zod types di `shared/types/common.ts`. tRPC middleware lengkap (workspaceProcedure, editorProcedure, ownerProcedure). Root router di `src/server/router.ts` memutus circular import. ThemeProvider (next-themes) wired di RootLayout. Step 4, 6, 7, 8 marked done.
- 0.5 — Backend schema applied. better-auth tables generated. 20 Drizzle tables (auth, workspace, category, owner-label, tag, asset, valuation, attachment, activity, sharing, currency) committed + migrated to local Postgres via postgres-js driver. `src/server/db.ts` aggregator imports all feature schemas. Step 5 + 6 marked done.
- 0.4 — Step 17 UI slicing complete: 22 routes (auth group, app, workspace area, public share), 3 layouts (auth/app/workspace), 6 shared components (AuthCard, PageHeader, EmptyState, AppTopbar, WorkspaceSidebar, WorkspaceSwitcher). typedRoutes disabled untuk Phase 1 (re-enable Phase 6). Resend lazy init untuk build dengan placeholder env.
- 0.3 — Status mark-up per step. Reality: step 1-4 done, 7+10+14+16 done, step 5/6/9/11/12 scaffolded (butuh credentials), step 13/15/17 pending. shadcn `form` belum installed (TODO step 4). Common Zod types deferred ke Phase 1.
- 0.2 — Update file path Step 4-8 ke feature-first layout: `src/shared/ui/`, `src/shared/utils/cn.ts`, `src/server/db.ts` aggregator, `src/server/auth.ts`, `src/server/trpc.ts`, per-feature `features/<name>/server/db.ts`. Drop clean-arch 8-layer.
- 0.1 — Initial Phase 0 checklist. 17 steps, 10-day plan, acceptance per step, risk register.
