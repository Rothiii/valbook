# Phase 0 — Foundation Checklist

# Collaborative Asset Workspace Platform

Version: 0.6
Source: [tech-stack.md](tech-stack.md) section 15
Target window: **Week 1–2** (10 working days)

---

## Status Summary

| Step | Status | Note |
|---|---|---|
| Pre-flight | 🟡 partial | GitHub + local env ✅, akun eksternal user TODO |
| 1. Repo + pnpm workspace | ✅ done | |
| 2. Next.js + TS | ✅ done | Next.js 16.2.6 (bukan 15, latest stable saat init) |
| 3. Biome + lefthook | ✅ done | Biome 2.4.15 |
| 4. Tailwind + shadcn/ui | ✅ done | `form` installed; ThemeProvider (next-themes) wired di RootLayout |
| 5. Drizzle + local Postgres | ✅ done | Schema lengkap semua phase. Migration generated + applied via `pnpm db:migrate`. Driver: postgres-js (works untuk local + Neon + Supabase + RDS) |
| 6. better-auth | ✅ done | Config + Drizzle schema generated. Email verification disabled (autoSignIn aktif); verify badge + resend button di /account |
| 7. tRPC v11 | ✅ done | Root router, middleware base, provider wired |
| 8. Zod schemas | ✅ done | Common types di `shared/types/common.ts`. Per-feature schemas Phase 1+ |
| 9. R2 client | 🟡 scaffold | Helper functions ready; butuh creds untuk test |
| 10. Resend + emails | ✅ done | Client + 3 templates (verify, reset, invitation) |
| 11. Upstash Redis | 🟡 scaffold | Rate limit + cache ready; butuh creds untuk test |
| 12. Sentry | 🟡 scaffold | Init no-op tanpa DSN |
| 13. Vercel project | ⏳ pending | User-driven setup |
| 14. GitHub Actions CI | ✅ done | Lint + typecheck + build green |
| 15. Seed data | ⏳ pending | Butuh DB + workspace_templates schema (Phase 1) |
| 16. Cron job | ✅ stub | Route + vercel.json wired; logic Phase 3 |
| 17. First E2E flow | 🟡 UI sliced | Semua Phase 1 page skeleton done; data wiring butuh DB |

Legend: ✅ done · 🟡 scaffolded (butuh credentials atau dependency) · ⏳ pending

---

## Overview

Phase 0 = setup tanpa fitur user-facing. Output: skeleton project ready untuk Phase 1 development. Akhir Phase 0 = user dapat register, login, create workspace dari template, lihat empty dashboard.

---

## Pre-flight (Day 0)

Setup akun sebelum mulai code. Lihat [../SETUP.md](../SETUP.md) untuk step-by-step.

- [x] **GitHub repo** — https://github.com/Rothiii/valbook
- [ ] **Vercel account** — connect ke GitHub
- [ ] **Neon account** — create project `valbook`, get connection string
- [ ] **Cloudflare R2** — create account, buckets `valbook-dev` + `valbook-prod`, API token
- [ ] **Resend account** — API key + domain verification
- [ ] **Upstash account** — Redis REST URL + token
- [ ] **Sentry account** — project `valbook-web`, DSN
- [ ] **Domain** (optional Phase 0)
- [x] **Local env** — Node 22 LTS, pnpm 10

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

## Step 9: R2 client 🟡

**Goal**: object storage signed URL.

**Files**:
- `apps/web/src/shared/lib/r2.ts` — S3 client + helpers

**Functions**:
- [x] `getUploadUrl({ key, contentType, sizeBytes })` — 10 min expiry
- [x] `getDownloadUrl(key)` — 5 min expiry
- [x] `deleteObject(key)`
- [x] Mime allowlist (image, pdf, doc, xls, csv, txt)
- [x] Max file size 25MB

**Acceptance**:
- [x] Helpers exported + typed
- [ ] **Pending R2 creds**: PUT file via curl sukses
- [ ] **Pending R2 creds**: GET via signed URL sukses, expire 5 min later
- [ ] **Pending R2 setup**: Bucket CORS configured

**Est**: 3 hours · **Actual**: scaffold done

---

## Step 10: Resend + React Email ✅

**Goal**: email send setup.

**Files**:
- [x] `apps/web/src/shared/lib/email.ts` — Resend client + `sendEmail` helper
- [x] `apps/web/src/emails/verify-email.tsx`
- [x] `apps/web/src/emails/invitation.tsx`
- [x] `apps/web/src/emails/password-reset.tsx`

**Acceptance**:
- [x] Template render HTML + plaintext
- [x] Wired ke better-auth email hooks
- [ ] **Pending Resend creds**: send test email sukses
- [ ] **Pending production**: domain verification + DKIM

**Est**: 4 hours · **Actual**: done

---

## Step 11: Upstash Redis 🟡

**Goal**: rate limit + cache.

**Files**:
- [x] `apps/web/src/shared/lib/redis.ts` — Upstash client
- [x] `apps/web/src/shared/lib/rate-limit.ts` — 8 rate limit configs
- [x] `apps/web/src/shared/lib/cache.ts` — get/set/invalidate/orFetch

**Rate limit configs** (per api-design.md section 8):
- [x] signUp (5/hour/IP), signIn (10/15min/IP)
- [x] shareCreate (10/hour/workspace), inviteMember (50/hour/workspace)
- [x] attachmentUpload (100/hour/user), valuationBulkImport (5/hour/workspace)
- [x] publicShareView (100/min/IP), default (1000/15min/user)

**Acceptance**:
- [x] Configs typed + exported
- [ ] **Pending Upstash creds**: Redis connection sukses dari serverless
- [ ] **Phase 1+**: Rate limit middleware wired di tRPC procedure pertama
- [ ] **Phase 3+**: Cache hit/miss tracked di dashboard

**Est**: 3 hours · **Actual**: scaffold done

---

## Step 12: Sentry SDK 🟡

**Goal**: error monitoring.

**Files**:
- [x] `apps/web/sentry.client.config.ts`
- [x] `apps/web/sentry.server.config.ts`
- [x] `apps/web/sentry.edge.config.ts`
- [x] `apps/web/instrumentation.ts` (with onRequestError export)

**Config**:
- [x] No-op kalau DSN tidak set (dev local quiet)
- [x] Sampling: 10% transactions, 100% errors
- [ ] **Phase 6**: Source map upload di CI (butuh auth token)
- [ ] **Phase 6**: Release tracking dari git SHA

**Acceptance**:
- [x] Init guarded by DSN presence
- [ ] **Pending Sentry creds**: test exception capture muncul di dashboard

**Est**: 2 hours · **Actual**: scaffold done

---

## Step 13: Vercel project + env ⏳

**Goal**: deploy preview.

User-driven setup (lihat SETUP.md section 3.8):

- [ ] Create Vercel project, connect repo
- [ ] Set root dir: `apps/web`
- [ ] Set build command sesuai SETUP.md
- [ ] Add semua env vars dari .env.example
- [ ] Setup Neon branch creation pada preview deploy
- [ ] Connect domain (kalau ada)

**Acceptance**:
- [ ] Push ke main → deploy sukses
- [ ] PR → preview deploy sukses
- [ ] Env var aktif di production
- [ ] Vercel Analytics aktif

**Est**: 2 hours · **Status**: pending user setup

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

## Step 16: Initial cron job ✅

**Goal**: rate refresh skeleton.

**Files**:
- [x] `apps/web/app/api/webhooks/cron/rate-refresh/route.ts` — stub dengan CRON_SECRET check
- [x] `apps/web/vercel.json` — schedule `0 */6 * * *`

**Logic**:
- [x] Verify `X-Cron-Secret` header
- [ ] **Phase 3**: Fetch fiat dari frankfurter.app
- [ ] **Phase 3**: Fetch crypto dari CoinGecko
- [ ] **Phase 3**: Upsert ke `exchange_rates`

**Acceptance**:
- [x] Schedule registered di vercel.json
- [x] Route handler responds dengan secret check
- [ ] **Phase 3**: Full implementation

**Est**: 3 hours · **Actual**: stub done

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
| Day 2 | 4, 5 (partial) | ✅ done |
| Day 3 | 5 (finish) | 🟡 scaffold only (butuh DB) |
| Day 4 | 6, 7 | 🟡 6 scaffold, 7 done |
| Day 5 | 8, 9 | 🟡 partial |
| Day 6 | 10, 11 | 🟡 10 done, 11 scaffold |
| Day 7 | 12, 13, 14 | 🟡 12 scaffold, 14 done |
| Day 8 | 15, 16 | 🟡 16 done, 15 deferred |
| Day 9 | 17 (start) | ⏳ slicing UI |
| Day 10 | 17 (finish + buffer) | ⏳ |

---

## Definition of Done — Phase 0

- [x] Phase 0 step 1-4, 7, 10, 14, 16 fully done
- [x] Step 17 UI slicing done (22 routes + 3 layouts + 6 shared components)
- [ ] Step 5, 6, 9, 11, 12 verified setelah user setup external accounts
- [ ] Step 13 deploy preview running
- [ ] Step 15 seed data jalan (Phase 1)
- [ ] Step 17 wiring: register + verify + login + create workspace working E2E
- [ ] Empty workspace dashboard load di desktop + mobile (verified)
- [ ] CI/CD green untuk PR + main (verify setelah first PR push)
- [ ] Tidak ada TODO P0 blocker untuk Phase 1

---

## Risk & Blockers

| Risk | Mitigation | Status |
|---|---|---|
| Neon connection pooling issue di Vercel edge | Pakai HTTP driver `@neondatabase/serverless` | ✅ implemented |
| better-auth Drizzle adapter quirk | Pin version, test register flow awal | ⏳ test pending |
| R2 CORS untuk direct upload | Set CORS origin di R2 settings | ⏳ user setup |
| Resend domain verification lambat | Setup DNS lebih awal | ⏳ Phase 6 launch |
| Drizzle migration drift | Selalu `generate` + commit migration file | ✅ workflow ready |
| Vercel build time | Cache pnpm store + Next.js cache enabled | ✅ CI configured |

---

## Changelog

- 0.6 — Backend wiring landed: workspace tRPC router (list/get/create/update/delete/membership) + service layer (template materialize, activity log). Better-auth client SDK menggantikan zustand auth mock (register/login/logout/verify/forgot-password/reset-password/updateProfile semua via `authClient`). Email verification disabled — register langsung sign-in (autoSignIn). `/account` menampilkan `EmailVerificationCard` (badge Verified/Unverified + tombol Send verification email). Common Zod types di `shared/types/common.ts`. tRPC middleware lengkap (workspaceProcedure, editorProcedure, ownerProcedure). Root router di `src/server/router.ts` memutus circular import. ThemeProvider (next-themes) wired di RootLayout. Step 4, 6, 7, 8 marked done.
- 0.5 — Backend schema applied. better-auth tables generated. 20 Drizzle tables (auth, workspace, category, owner-label, tag, asset, valuation, attachment, activity, sharing, currency) committed + migrated to local Postgres via postgres-js driver. `src/server/db.ts` aggregator imports all feature schemas. Step 5 + 6 marked done.
- 0.4 — Step 17 UI slicing complete: 22 routes (auth group, app, workspace area, public share), 3 layouts (auth/app/workspace), 6 shared components (AuthCard, PageHeader, EmptyState, AppTopbar, WorkspaceSidebar, WorkspaceSwitcher). typedRoutes disabled untuk Phase 1 (re-enable Phase 6). Resend lazy init untuk build dengan placeholder env.
- 0.3 — Status mark-up per step. Reality: step 1-4 done, 7+10+14+16 done, step 5/6/9/11/12 scaffolded (butuh credentials), step 13/15/17 pending. shadcn `form` belum installed (TODO step 4). Common Zod types deferred ke Phase 1.
- 0.2 — Update file path Step 4-8 ke feature-first layout: `src/shared/ui/`, `src/shared/utils/cn.ts`, `src/server/db.ts` aggregator, `src/server/auth.ts`, `src/server/trpc.ts`, per-feature `features/<name>/server/db.ts`. Drop clean-arch 8-layer.
- 0.1 — Initial Phase 0 checklist. 17 steps, 10-day plan, acceptance per step, risk register.
