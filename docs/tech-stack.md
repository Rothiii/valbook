# Technology Stack & Infrastructure

# Collaborative Asset Workspace Platform

Version: 0.1
Source: cross-doc decisions from [erd.md](erd.md), [api-design.md](api-design.md), [mvp-stories.md](mvp-stories.md), [permission-matrix.md](permission-matrix.md), [ux-flows.md](ux-flows.md)

---

## 1. Stack Summary

| Layer | Choice | Purpose |
|---|---|---|
| **Runtime** | Node 22 LTS | Server runtime |
| **Language** | TypeScript 5.6+ | Type-safe end-to-end |
| **Framework** | Next.js 15 (App Router) | Full-stack React monolith |
| **UI library** | React 19 | Component layer |
| **Styling** | Tailwind CSS v4 | Utility-first |
| **UI components** | shadcn/ui | Headless + Radix primitives, custom-owned |
| **Form** | React Hook Form + zod resolver | Validation + UX |
| **Validation** | Zod | Shared client + server schema |
| **API (internal)** | tRPC v11 | Type-safe RPC |
| **API (public)** | Next.js Route Handlers | REST untuk public share + webhooks |
| **Auth** | better-auth | Sessions, OAuth, email verify, password reset |
| **DB** | PostgreSQL 16 (managed by Neon) | Primary data store |
| **ORM** | Drizzle ORM | TS-native query builder + migrations |
| **Object storage** | Cloudflare R2 | Attachment files |
| **Email** | Resend + React Email | Transactional email |
| **Cache + rate limit** | Upstash Redis | Aggregations cache + rate limiter |
| **Background jobs** | Vercel Cron | Rate refresh, cleanup, scheduled tasks |
| **Charts** | Recharts | Valuation + dashboard charts |
| **Date** | date-fns | Date formatting + manipulation |
| **i18n** | next-intl | Locale routing, ID + EN |
| **Hosting** | Vercel | Edge + serverless deploy |
| **Monitoring** | Sentry | Error tracking + perf |
| **Analytics** | Vercel Analytics | Page view + web vitals |
| **Logs** | Vercel built-in + pino | Structured |
| **CI/CD** | GitHub Actions + Vercel | Lint, typecheck, test, deploy |
| **Linter/Formatter** | Biome | Faster than ESLint+Prettier |
| **Git hooks** | lefthook | Pre-commit checks |
| **Pkg manager** | pnpm | Monorepo-friendly, fast install |
| **Test (unit)** | Vitest | Fast TS-native runner |
| **Test (e2e)** | Playwright | Cross-browser E2E |

---

## 2. Confirmed Decisions

### 2.1 Hosting — **Vercel**

- Native Next.js DX, preview environments per PR.
- Edge runtime for public share endpoints.
- Built-in cron untuk rate refresh.
- Cost: Pro plan target post-launch (~$20/mo).

**Region**: Singapore (sin1) primary untuk audience Indonesia. Edge global.

### 2.2 Database — **Neon**

- Serverless Postgres, autoscale.
- Database branching untuk preview env (one DB per PR).
- Free tier untuk dev, scale plan post-launch.

**Setup**: 1 production DB, 1 staging DB, branch-per-PR di dev.

### 2.3 Object Storage — **Cloudflare R2**

- S3-compatible API.
- **Zero egress fees** — kritikal untuk public share viewing.
- Bucket naming: `asset-workspace-{env}` (prod, staging, dev).

**Key pattern**:
```
{workspaceId}/{assetId}/{attachmentId}.{ext}
```

**Access**:
- Upload: server-issued presigned PUT URL (10 min expiry, max 25MB).
- Download: server-issued presigned GET URL (5 min expiry).
- No public bucket access.

### 2.4 Email — **Resend + React Email**

- React Email untuk template (typed components).
- Resend SDK untuk send.
- Domain verification + DKIM saat setup.

**Email types MVP**:
- Email verification
- Password reset
- Workspace invitation
- Role change notification (defer V2)

### 2.5 Monitoring — **Sentry**

- Frontend + backend error capture.
- Performance monitoring (transactions, slow queries).
- Source maps uploaded di CI.
- Release tracking otomatis dari git SHA.

**Sampling**: 100% error, 10% transactions di production.

### 2.6 Analytics — **Vercel Analytics**

- Built-in untuk Vercel, no setup.
- Web Vitals + page views.
- No custom event tracking MVP.

**Defer ke V2**: PostHog kalau butuh funnel / feature flag.

### 2.7 Cache + Rate Limit — **Upstash Redis**

- Serverless Redis, pay-per-request.
- `@upstash/ratelimit` library.
- Cache dashboard aggregations (1 menit TTL).
- Cache exchange rates (1 jam TTL).
- Cache public share data (60s edge cache + Redis lookup).

### 2.8 Background Jobs — **Vercel Cron**

- Built-in scheduler via `vercel.json`.
- Routes: `/api/webhooks/cron/*`.
- Auth: `X-Cron-Secret` header.

**Jobs MVP**:
- `rate-refresh` — every 6h, fetch from frankfurter + CoinGecko
- `cleanup-expired-invitations` — daily, mark expired
- `cleanup-expired-shares` — daily, soft revoke
- `cleanup-orphan-attachments` — weekly, delete R2 keys tanpa DB row

---

## 3. Design Direction

### 3.1 Mobile + Desktop **Equal Priority**

- Design phase: parallel mockup desktop + mobile.
- Dev phase: Tailwind responsive utilities, mobile-first CSS approach.
- Bottom nav untuk mobile, sidebar untuk desktop.
- Asset table → card list di mobile.
- Modal → full-screen di mobile.

**Timeline impact**: +2 minggu vs desktop-first. MVP target ~**20 minggu** (5 bulan).

### 3.2 Onboarding — Empty State CTAs Only

- No tour library (Driver.js / Shepherd).
- Pakai empty state component dengan primary action + helper text.
- Inline tooltip pakai shadcn/ui `Tooltip` di area awal.
- Defer interactive walkthrough ke V2.

---

## 4. Data Model Decisions

### 4.1 Asset Code Uniqueness — **Per workspace, nullable**

- Schema: `assets.code` nullable text.
- Constraint: `UNIQUE(workspace_id, code) WHERE code IS NOT NULL`.
- Update [erd.md](erd.md) section 2.9 + add migration constraint.

### 4.2 Public Share View Tracking — **Skip MVP**

- Tidak ada `share_views` table.
- Tidak ada increment counter di public_shares.
- Defer ke V2 kalau ada permintaan analytics share.

---

## 5. Repo Structure (proposed)

```
asset-workspace/
├── apps/
│   └── web/                       # Next.js app
│       ├── app/
│       │   ├── (marketing)/
│       │   ├── (auth)/
│       │   ├── (app)/
│       │   │   └── w/[slug]/...
│       │   ├── public/[token]/
│       │   └── api/
│       │       ├── auth/[...all]/
│       │       ├── public/[token]/
│       │       ├── attachments/
│       │       └── webhooks/cron/
│       ├── src/
│       │   ├── server/
│       │   │   ├── routers/
│       │   │   ├── db/            # Drizzle schema + queries
│       │   │   ├── auth/          # better-auth config
│       │   │   ├── jobs/          # cron handlers
│       │   │   └── trpc.ts
│       │   ├── lib/
│       │   │   ├── schema/        # zod
│       │   │   ├── utils/
│       │   │   ├── r2.ts
│       │   │   ├── email.ts
│       │   │   └── rate-limit.ts
│       │   ├── components/
│       │   │   ├── ui/            # shadcn/ui
│       │   │   └── ...
│       │   ├── emails/            # React Email templates
│       │   └── styles/
│       ├── drizzle/               # migrations
│       └── tests/
│           ├── unit/
│           └── e2e/
├── packages/                      # opsional future shared
├── .github/workflows/
├── biome.json
├── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
└── vercel.json
```

**Decision**: monorepo via pnpm workspace untuk siap split package nanti. MVP cuma 1 app, tapi struktur disiapkan.

---

## 6. Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Better-auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://...

# OAuth (V2)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=asset-workspace-prod
R2_PUBLIC_URL=https://cdn.example.com

# Resend
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@example.com

# Upstash Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Exchange rates
FRANKFURTER_URL=https://api.frankfurter.app
COINGECKO_API_KEY=...

# Cron
CRON_SECRET=...

# Sentry
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...

# App
NEXT_PUBLIC_APP_URL=https://app.example.com
NODE_ENV=production
```

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions

`.github/workflows/ci.yml`:
1. Setup Node 22 + pnpm
2. Install dependencies (cached)
3. Lint (Biome)
4. Typecheck (tsc --noEmit)
5. Unit test (Vitest)
6. Build (Next.js)
7. E2E test (Playwright with seeded DB)

Run on: every push, every PR.

### 7.2 Vercel Deploy

- Preview deploy: per PR (Neon branch DB + Resend test mode).
- Production deploy: merge to `main` → auto deploy.
- Rollback: Vercel dashboard one-click.

---

## 8. Testing Strategy

### 8.1 Unit (Vitest)

- Coverage target: 70% lines.
- Focus: utility functions, validation schema, permission middleware logic.
- Run in CI + pre-push.

### 8.2 Integration (Vitest + test DB)

- Test tRPC routers dengan real DB (test container via testcontainers).
- Permission matrix cases per role.
- Multi-currency conversion edge cases.

### 8.3 E2E (Playwright)

- Smoke flow: register → create workspace → add asset → invite → share.
- Run di CI on staging.
- Visual regression opsional di V2.

---

## 9. Performance Budget

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| TBT (Total Blocking Time) | < 200ms |
| API p95 latency | < 300ms |
| Dashboard load (cold) | < 1.5s |
| DB query p95 | < 50ms |
| Bundle initial JS | < 200KB gzip |

Pantau via Sentry Performance + Vercel Speed Insights.

---

## 10. Security Baseline

- HTTPS only via Vercel default.
- CSP header strict (no inline script except hashed).
- Cookie: `httpOnly`, `secure`, `sameSite=lax` (better-auth default).
- CSRF: SameSite cookie + origin check.
- SQL injection: Drizzle parameterized (never raw template).
- XSS: React default escape + DOMPurify untuk user HTML kalau ada (notes field plain text saja MVP).
- File upload: mime type + size validation di server, scan file extension match.
- Rate limit semua public endpoint + auth.
- Audit log mandatory untuk semua mutasi.

---

## 11. Backup & Recovery

- **DB**: Neon point-in-time recovery (7 days retention free tier).
- **R2**: object versioning enabled (V2). MVP: hapus = hapus.
- **Activity log**: never delete = effective audit trail.
- **DR plan**: documented runbook di `docs/runbook.md` (V2).

---

## 12. Cost Estimate (MVP / month)

| Service | Free tier | Estimated |
|---|---|---|
| Vercel | Hobby free, Pro $20/mo | $0–$20 |
| Neon | 0.5GB free, scale $19/mo | $0–$19 |
| Cloudflare R2 | 10GB storage + 1M ops free | $0 (likely) |
| Resend | 3000 email/mo free | $0 (likely MVP) |
| Upstash Redis | 10K req/day free | $0–$10 |
| Sentry | 5k errors free | $0 |
| Domain | – | $12/yr |

**Estimated MVP monthly**: **$0 – $50** sambil traffic kecil.

---

## 13. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| Vercel function timeout (CSV import besar) | Stream + chunked processing, batch insert max 500 rows |
| Neon cold start | Connection pooling via `@neondatabase/serverless` + Drizzle HTTP driver |
| R2 region latency dari Indonesia | Cloudflare global edge, low latency expected |
| Exchange rate API downtime | Cache last known rate, fallback warning di UI |
| better-auth breaking changes | Pin version, test major upgrade di branch |
| Mobile + desktop equal priority overrun | Re-prioritize stories ke desktop-only di Phase 6 kalau mundur >2 minggu |

---

## 14. Out of Scope Tech (V2+)

- **CDN custom**: pakai default Vercel + R2 + Cloudflare.
- **Custom domain per workspace**: defer.
- **Self-host option**: kalau ada demand enterprise.
- **OpenTelemetry full**: Sentry cukup MVP.
- **Feature flag platform**: PostHog kalau dibutuhkan.
- **Email digest / marketing**: bukan transactional, defer.
- **Webhook for third-party**: defer.
- **API keys public**: defer.

---

## 15. Implementation Order (Phase 0)

1. [ ] `pnpm init` + workspace setup
2. [ ] Next.js 15 app router init
3. [ ] TypeScript + Biome config
4. [ ] Tailwind v4 + shadcn/ui init
5. [ ] Drizzle setup + Neon connection
6. [ ] Initial schema migration (ERD section 1-2)
7. [ ] better-auth integration + user table
8. [ ] tRPC v11 boilerplate (`server/trpc.ts`, root router)
9. [ ] Zod schema folder structure
10. [ ] R2 client + signed URL helper
11. [ ] Resend client + React Email template stub
12. [ ] Upstash rate limit + cache helper
13. [ ] Sentry SDK setup (client + server)
14. [ ] Vercel project + env vars
15. [ ] GitHub Actions CI
16. [ ] Seed: currencies, workspace_templates (6 builtin)
17. [ ] First end-to-end: register → create workspace from template

---

## 16. Changelog

- 0.1 — Initial stack pinning. Vercel + Neon + R2 + Resend + better-auth + tRPC + Drizzle + Upstash + Sentry. Mobile equal priority confirmed (timeline +2 weeks → ~20 weeks).
