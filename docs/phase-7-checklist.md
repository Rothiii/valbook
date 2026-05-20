# Phase 7 — Production Wiring (Super Last Phase)

# Collaborative Asset Workspace Platform

Version: 0.1
Source: cross-doc — third-party swap dari local fallback
Window: **Week 21+** (post-MVP), 10 working days

---

## Status

⏳ **Pending Phase 0-6 completion**. Phase 7 = swap implementation di balik existing API surface ke third-party SaaS. Tidak ada feature baru — semua sudah jalan di lokal.

---

## Overview

Phase 7 = production wiring. Output: app deployed dengan SaaS-backed storage, email, cache, monitoring, custom domain, dan beta launch. **Pre-requisite**: semua Phase 0-6 acceptance pass di lokal.

**Filosofi**: Phase 0-6 sengaja designed dengan API surface yang tidak vendor-specific (`saveFile`, `sendEmail`, `cacheGet`, `checkRateLimit`). Phase 7 cukup swap implementation di `shared/lib/*` tanpa ubah app code.

---

## Service Map

| Layer | Local fallback (Phase 0-6) | Production target |
|---|---|---|
| Database | DBngin Postgres 17 localhost:5432 | Neon (atau Supabase) |
| File storage | `public/uploads/` filesystem | Cloudflare R2 (presigned URLs) |
| Email | `[email:local-mode]` console log | Resend |
| Cache | In-memory `Map` + TTL | Upstash Redis |
| Rate limit | In-memory sliding window | Upstash Ratelimit |
| Error monitoring | Sentry no-op | Sentry full sampling |
| Currency rates | Builtin seed JSON | Frankfurter (fiat) + CoinGecko (crypto) via cron |
| Cron scheduler | Stub endpoint | Vercel cron `0 */6 * * *` |
| Hosting | `pnpm dev` localhost:3000 | Vercel + custom domain |
| Uptime | Manual local check | BetterStack atau Vercel uptime monitor |

---

## Pre-flight

Setup akun + bayar minimal sebelum mulai Phase 7:

- [ ] **Vercel account** — connect ke GitHub
- [ ] **Neon account** — create project `valbook`, get connection string (atau Supabase kalau pivot)
- [ ] **Cloudflare R2** — create account, buckets `valbook-prod` (+ `valbook-staging` opsional), API token
- [ ] **Resend account** — API key + akan verify domain di Step 7
- [ ] **Upstash account** — Redis REST URL + token
- [ ] **Sentry account** — project `valbook-web`, DSN
- [ ] **Domain** — beli `.com` / `.id` / `.app`
- [ ] **BetterStack** (opsional) — uptime + status page

---

## Step Groups

### Group 7.1 — Production DB (Neon) — Day 1

- [ ] Create Neon project `valbook`, region terdekat ke target user
- [ ] Get pooled connection string (`-pooler` endpoint untuk serverless)
- [ ] Set `DATABASE_URL` env di Vercel project (Production + Preview scopes)
- [ ] Run `pnpm db:migrate` against Neon production (one-time)
- [ ] (Opsional) Setup Neon branch creation pada preview deploy
- [ ] Run `pnpm db:seed` populate currencies + templates di production

**Acceptance**:
- [ ] Local build connect ke Neon via `DATABASE_URL` override
- [ ] Schema sama dengan migration di local
- [ ] Workspace template seed visible

---

### Group 7.2 — File Storage Swap (R2) — Day 2

**Goal**: swap `shared/lib/storage.ts` implementation dari local FS ke R2 presigned URLs. Existing API surface (`saveFile`, `getFileUrl`, `deleteFile`) tetap.

- [ ] Re-install `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
- [ ] Refactor `shared/lib/storage.ts`:
  - Env-gated: kalau `R2_ACCOUNT_ID` set → R2 mode, kalau enggak → local FS
  - `saveFile()` → PUT ke R2 via SDK; OR ganti API jadi `getUploadUrl()` returning presigned URL untuk direct client upload
  - `getFileUrl()` → presigned GET 5 menit
  - `deleteFile()` → R2 DeleteObject
- [ ] Update attachment frontend untuk pakai presigned flow (kalau API berubah)
- [ ] R2 bucket CORS configure untuk origin production
- [ ] R2 bucket policy: no public access

**Acceptance**:
- [ ] Upload 5MB image ke R2 sukses, <5s
- [ ] Download URL works dan expire 5 min later
- [ ] Delete remove dari R2 + DB
- [ ] Local mode masih jalan (env-gated fallback)

---

### Group 7.3 — Email Provider (Resend) — Day 3

**Goal**: aktifkan Resend di production. `RESEND_API_KEY` di-set → existing `sendEmail` helper auto-pakai Resend, kalau kosong → tetap log console.

- [ ] Tambah `RESEND_API_KEY` env di Vercel
- [ ] Verify Resend domain di subdomain `mail.{domain}` atau `send.{domain}` — set DKIM + SPF + DMARC
- [ ] Update `RESEND_FROM_EMAIL` env ke `noreply@mail.{domain}` (atau equivalent)
- [ ] Test send email dari production domain → cek inbox + bukan spam (Gmail + Outlook)
- [ ] Aktifkan kembali verification email opsional di better-auth config kalau mau (sendOnSignUp atau verify required di route)
- [ ] Monitor bounce rate Resend dashboard

**Acceptance**:
- [ ] Register di production trigger verification email yang sampai inbox
- [ ] Invitation email sampai dengan domain reputation OK
- [ ] Password reset email sampai dengan link valid

---

### Group 7.4 — Cache + Rate-limit (Upstash) — Day 4

**Goal**: aktifkan Upstash. `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` di-set → existing `cacheGet/Set` + `checkRateLimit` auto-pakai Redis.

- [ ] Create Upstash Redis instance regional ke Vercel deployment
- [ ] Set env di Vercel: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- [ ] Verify `isUpstashConfigured = true` di runtime
- [ ] Test cache hit untuk dashboard aggregation (Phase 3 endpoint)
- [ ] Test rate limit untuk signUp + signIn + publicShareView (sliding window cocok dengan Phase 0 config)
- [ ] Monitor Upstash metrics

**Acceptance**:
- [ ] Dashboard query cache hit di 2nd request (<50ms vs ~300ms cold)
- [ ] 6th signUp dari same IP di 1 jam → 429 error
- [ ] Cache invalidation pada workspace update tercermin di public share <60s

---

### Group 7.5 — Error Monitoring (Sentry) — Day 5

- [ ] Create Sentry project `valbook-web`, dapat DSN
- [ ] Set env: `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` di Vercel
- [ ] Set `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT` untuk source map upload via CI
- [ ] Update CI workflow untuk run `sentry-cli releases new` + upload source maps pada deploy
- [ ] Sentry dashboard: error rate panel
- [ ] Sentry alert rules:
  - Spike error rate >5/min
  - New error type baru muncul
  - Performance regression >50%
- [ ] Slack webhook untuk alert (atau email)
- [ ] Test trigger error di production untuk verify

**Acceptance**:
- [ ] Test exception capture muncul di Sentry dashboard
- [ ] Source map decoded (stack trace readable)
- [ ] Alert fire kalau spike (test trigger)
- [ ] Sampling rate 10% transactions, 100% errors

---

### Group 7.6 — Cron + Live Rates — Day 6

- [ ] Implement live rate fetch di `app/api/webhooks/cron/rate-refresh/route.ts`:
  - Fetch fiat dari frankfurter.app (base EUR atau USD)
  - Fetch crypto dari CoinGecko (top 50 list)
  - Upsert ke `exchange_rates` dengan `valid_from = now()`, `source = 'api'`
  - Handle API failure gracefully (log via Sentry + retry next cycle)
- [ ] Set `CRON_SECRET` env di Vercel
- [ ] Verify `vercel.json` cron schedule `0 */6 * * *` aktif
- [ ] Manual trigger first run via `curl -H "x-cron-secret: ..." https://{domain}/api/webhooks/cron/rate-refresh`
- [ ] Monitor cron execution log

**Acceptance**:
- [ ] Cron run otomatis tiap 6 jam
- [ ] Populate ≥30 fiat + 20 crypto rate per run
- [ ] API failure tidak crash (graceful log + skip)
- [ ] Cron secret enforce 401 kalau header mismatch

---

### Group 7.7 — Deploy (Vercel) — Day 7

- [ ] Create Vercel project, connect repo
- [ ] Set root dir: `apps/web`
- [ ] Set build command sesuai SETUP.md
- [ ] Add semua env vars dari production .env
- [ ] Setup Neon branch creation pada preview deploy (opsional)
- [ ] Push ke main → deploy sukses
- [ ] PR → preview deploy sukses
- [ ] Vercel Analytics enable
- [ ] Vercel Speed Insights enable

**Acceptance**:
- [ ] Push main → production deploy <5 min
- [ ] PR → preview deploy <5 min
- [ ] Env var aktif di production
- [ ] Build cache hit rate >80% di CI

---

### Group 7.8 — Custom Domain + SEO Verify — Day 8

- [ ] Beli domain (Cloudflare Registrar / Namecheap / Porkbun)
- [ ] Vercel Settings → Domains → Add → set A/CNAME di registrar
- [ ] Verify HTTPS auto-provisioned (Let's Encrypt)
- [ ] Update env: `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`
- [ ] Redirect www↔apex
- [ ] Update privacy policy: third-party list (Vercel, Neon, Sentry, Resend, Cloudflare R2, Upstash)
- [ ] Google Search Console verify (TXT record)
- [ ] Submit sitemap.xml
- [ ] Bing Webmaster Tools verify + submit sitemap
- [ ] Test OG preview render di WA + Twitter (opengraph.xyz debug)

**Acceptance**:
- [ ] Custom domain serve HTTPS
- [ ] `https://{domain}/sitemap.xml` accessible
- [ ] Search Console "URL inspection" landing = indexable
- [ ] Lighthouse SEO score >95 di production

---

### Group 7.9 — Backup + DR — Day 9

- [ ] Neon point-in-time recovery enable (7 days)
- [ ] Test restore ke Neon branch staging dari snapshot
- [ ] R2 versioning enable (opsional, recommended)
- [ ] Cron untuk export DB dump weekly ke R2 (DR backup):
  - `pg_dump --schema-only` + `pg_dump --data-only` ke gzip
  - Upload ke R2 bucket dengan retention 30 hari
- [ ] Update `docs/runbook.md` dengan Neon restore procedure
- [ ] Test simulate DB connection loss → verify recovery time

**Acceptance**:
- [ ] PITR restore tested successful ke staging branch
- [ ] Weekly DR backup cron green
- [ ] Runbook step-by-step verified

---

### Group 7.10 — Monitoring + Launch — Day 10

- [ ] Update `/api/health` untuk ping DB + R2 + Redis + Sentry
- [ ] Uptime monitor (BetterStack atau Vercel) hit health endpoint tiap 1 menit
- [ ] Status page (BetterStack public atau Vercel status)
- [ ] Final smoke test seluruh flow di production
- [ ] Beta invite list email blast (manual atau form)
- [ ] Onboarding email setelah signup (welcome + getting started link)
- [ ] Help docs / FAQ minimal di `/help`
- [ ] Sign off retro

**Acceptance**:
- [ ] First real beta user signup success without intervention
- [ ] Email reach inbox (not spam)
- [ ] All monitoring green
- [ ] Status page public accessible
- [ ] Production stable >48 jam

---

## DoD — Phase 7 / Production Live

- [ ] All third-party services wired + env-gated fallback intact untuk local dev
- [ ] Production deploy stable >48 jam
- [ ] Custom domain serve HTTPS + SEO indexed
- [ ] Email deliverability OK (inbox bukan spam)
- [ ] Monitoring + alerting active (Sentry + Slack/email + uptime)
- [ ] Backup tested + DR plan validated
- [ ] First beta user complete full journey
- [ ] Documentation complete (production runbook)

---

## Risk & Blockers

| Risk | Mitigation |
|---|---|
| Vendor lock-in pada Neon | Driver `postgres-js` universal; bisa migrate ke Supabase/RDS tanpa code change |
| R2 CORS misconfig saat first deploy | Test di staging dulu, document CORS policy di runbook |
| Resend domain warmup lambat | Setup DNS 1 minggu sebelum launch, monitor bounce rate |
| Cron rate limit dari Frankfurter/CoinGecko | Graceful failure + last-known rate fallback |
| Upstash region mismatch ke Vercel | Pilih Upstash region sama dengan Vercel deployment |
| Sentry sampling biaya | Default 10% transactions, adjust kalau quota habis |

---

## Changelog

- 0.1 — Initial Phase 7 checklist. Split dari Phase 0 + 6 yang sebelumnya campur third-party setup. Strategy: swap implementation di balik existing API surface, MVP local-only sampai Phase 6 done dulu.
