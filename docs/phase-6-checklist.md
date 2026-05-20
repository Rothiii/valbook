# Phase 6 — Polish + Launch Checklist

# Collaborative Asset Workspace Platform

Version: 0.3
Source: cross-doc — final hardening pre-customer
Window: **Week 19–20** (10 working days)

---

## Overview

Phase 6 = **app-level polish + readiness**. Output: feature lengkap, UX rapi, security audit lulus, i18n jalan, runbook tertulis. **App siap untuk produksi tapi belum di-deploy** — semua third-party SaaS wiring (Vercel, Neon, R2, Resend, Upstash, Sentry, domain) dipindah ke [phase-7-checklist.md](phase-7-checklist.md).

**Acceptance gate**: app jalan lengkap di lokal dengan semua fitur MVP, security checklist green, dokumentasi runbook + privacy + terms siap; tinggal swap implementation ke third-party di Phase 7 tanpa ubah call site.

---

## Step Groups

### Group 6.1 — UX Polish (Day 1–2)

**Day 1: Empty + loading + error states**

- [ ] Audit semua list (assets, members, valuation, activity, categories, sharing, tags, attachments) punya empty state
- [ ] Empty state component standardized: icon + headline + body + primary CTA
- [ ] Loading skeleton semua page (consistent)
- [ ] Error toast pattern (success / error / warning / info variants)
- [ ] 404 page custom (back to dashboard CTA)
- [ ] 403 page custom (clear explanation + contact owner CTA)
- [ ] 500 page custom (retry button)
- [ ] Network offline detection + banner

**Day 2: Micro-interactions**

- [ ] Form button loading state (spinner inside button)
- [ ] Optimistic UI untuk archive, tag assign, value change (low-stake)
- [ ] Toast position consistent (top-right desktop, bottom mobile)
- [ ] Confirm modals consistent style
- [ ] Keyboard shortcuts (Cmd+K command palette stretch, defer V2 kalau tight)
- [ ] Focus ring visible
- [ ] Animation: page transition + modal in/out

**Acceptance**:
- [ ] Empty state tampil untuk semua resource
- [ ] No "white screen" pada navigasi (skeleton)
- [ ] Error toast tidak overlap content
- [ ] Mobile + desktop UX konsisten

---

### Group 6.2 — Accessibility Audit (Day 3)

- [ ] Run axe-core scan, fix all violations
- [ ] Keyboard nav: tab order logical seluruh app
- [ ] Form: label associated, error announced via aria-live
- [ ] Modal: focus trap, ESC close
- [ ] Skip-to-content link
- [ ] Color contrast AA pass
- [ ] Screen reader test 1 critical flow (asset create)
- [ ] Reduced motion preference respected (no auto-animation)

**Acceptance**:
- [ ] axe-core scan: 0 critical/serious violation
- [ ] Lighthouse Accessibility >95

---

### Group 6.3 — Performance Pass (Day 4)

- [ ] Bundle size analyzer
- [ ] Code-split: marketing pages from app
- [ ] Lazy load Recharts (chart pages only)
- [ ] Image optimize (next/image untuk attachment thumbnails)
- [ ] DB query plan audit: dashboard, asset list, activity log
- [ ] Add missing index kalau ada N+1 atau seq scan
- [ ] Server-side cache hot path (dashboard 1 min)
- [ ] React Query stale time tune
- [ ] Local Lighthouse audit (Speed Insights → Phase 7)
- [ ] Static asset cache header set di Next.js config (CDN check → Phase 7)

**Acceptance**:
- [ ] LCP <2.5s
- [ ] TBT <200ms
- [ ] API p95 <300ms
- [ ] Dashboard cold <1.5s
- [ ] Initial JS <200KB gzip
- [ ] Lighthouse Performance >90

---

### Group 6.4 — Security Audit (Day 5)

- [ ] CSP header strict (no inline kecuali hashed)
- [ ] Cookie httpOnly, secure, sameSite=lax (verify)
- [ ] CSRF check origin (better-auth default)
- [ ] Rate limit verify per endpoint (api-design section 8)
- [ ] SQL injection scan (Drizzle parameterized — manual audit any raw SQL)
- [ ] XSS audit: notes field, custom field text → escape via React default + DOMPurify kalau richtext
- [ ] File upload: mime + extension match validation
- [ ] Local: file path scoping di `storage.ts` (refuse delete outside `public/uploads/`); R2 bucket policy → Phase 7
- [ ] All API keys env-only (no commit); Resend wiring → Phase 7
- [ ] Environment variable audit
- [ ] Secret rotation plan documented
- [ ] Dependency scan (`pnpm audit`, fix critical/high)
- [ ] OWASP top 10 self-checklist:
  - A01 Broken access control — permission matrix tested
  - A02 Crypto failures — bcrypt/argon2 via better-auth, HTTPS only
  - A03 Injection — Drizzle parameterized, zod validate
  - A04 Insecure design — permission middleware layered
  - A05 Misconfig — CSP, security headers, no debug in prod
  - A06 Vulnerable components — pnpm audit pass
  - A07 Auth failures — better-auth managed, rate limit, email verify
  - A08 Data integrity — DB constraints, audit log
  - A09 Logging failures — activity log + structured logger (Sentry → Phase 7)
  - A10 SSRF — no user-controlled URL fetch in MVP

**Acceptance**:
- [ ] All OWASP items checked
- [ ] `pnpm audit` no critical/high
- [ ] Security header score A+ di securityheaders.com

---

### Group 6.5 — i18n Indonesia + English (Day 6)

- [ ] next-intl setup verify (kalau belum done earlier)
- [ ] Extract semua hardcoded string ke message file
- [ ] `messages/id.json` + `messages/en.json`
- [ ] Locale routing: `/[locale]/...` atau cookie-based
- [ ] Date format ikut locale (date-fns/locale)
- [ ] Number format ikut locale (Intl.NumberFormat)
- [ ] Currency format pakai Intl.NumberFormat
- [ ] Email template ikut user locale

**Acceptance**:
- [ ] Toggle ID/EN seluruh app
- [ ] No fallback English di label ID
- [ ] Date "18 Mei 2026" untuk ID, "May 18, 2026" untuk EN
- [ ] Email locale benar (test 2 user beda locale)

---

### Group 6.6 — Backup + Recovery — Runbook Only (Day 7)

**Phase 6 (local)**: tulis runbook saja. Live backup/restore configuration → Phase 7.

- [ ] Runbook doc: `docs/runbook.md`
  - Incident response template
  - DB rollback steps (pg_dump/pg_restore local)
  - Rotation key procedure
  - Common error remediation
  - On-call escalation
- [ ] Test pg_dump + pg_restore di local Postgres
- [ ] Document restore procedure step-by-step
- [ ] **→ Phase 7**: Neon point-in-time recovery (7d), R2 versioning, weekly DR backup cron, restore test ke staging

**Acceptance**:
- [ ] Runbook documented + reviewed
- [ ] Local pg_dump/restore tested

---

### Group 6.7 — Monitoring Hooks (Day 8)

**Phase 6 (local)**: pasang hook + endpoint. Live dashboard/alert/uptime monitor → Phase 7.

- [ ] Custom event hook minimal: signup, workspace_create, asset_create, valuation_add, share_create — log via pino structured logger (Phase 7 wire ke Vercel Analytics / PostHog)
- [ ] Health check endpoint `/api/health` — DB ping (local Postgres); kondisional cek storage/cache/Sentry kalau env set
- [ ] **→ Phase 7**: Sentry dashboard + alert rules, BetterStack/Vercel uptime monitor, Slack webhook, R2/Redis ping di /api/health

**Acceptance**:
- [ ] Health endpoint return 200 normal (DB up), 503 kalau DB down
- [ ] Event log muncul di console saat trigger

---

### Group 6.8 — Legal + Compliance (Day 9 setengah)

- [ ] Privacy Policy page `/privacy` — generic template, mention: data collected, retention, user rights. Third-party list (Vercel, Neon, Sentry, Resend, Cloudflare) update saat Phase 7
- [ ] Terms of Service `/terms` — usage rules, liability, payment future
- [ ] Cookie banner kalau pakai cookie selain auth (analytics opsional)
- [ ] GDPR-ish: account delete flow (defer V2 implementation, doc commitment)
- [ ] Email footer: unsubscribe link untuk non-transactional (kalau future ada digest)
- [ ] Indonesian PDP Law alignment doc note

---

### Group 6.9 — Account Settings + GDPR (Day 9 setengah)

- [ ] `/account` page
- [ ] Edit name + avatar
- [ ] Change email (verify new email)
- [ ] Change password
- [ ] Active sessions list + revoke
- [ ] Delete account button (confirm + cascade workspace yang dia owner-only — block kalau ada non-owner workspace dengan member lain, force transfer first)

**Acceptance**:
- [ ] Edit name + avatar persist
- [ ] Change password require old + new + confirm
- [ ] Delete account confirm modal + irreversible warning
- [ ] Owner-only workspace deleted, member workspace user diremove dari membership

---

### Group 6.10 — Notification (Basic) (Day 10 pagi)

Bukan notif center penuh — hanya beberapa transactional email + in-app banner sederhana.

- [ ] Email: invitation accepted (notify inviter)
- [ ] Email: role changed (notify user)
- [ ] Email: removed from workspace
- [ ] In-app: banner "Welcome to {workspace}" sekali setelah accept
- [ ] In-app: banner "Your role changed to {role}" sekali setelah update

**Defer V2**: digest email, asset value change notification, mention/comment.

---

### Group 6.11 — SEO Code Baseline (Day 10 pagi-siang)

**Phase 6 (local)**: tulis kode SEO + metadata yang siap pakai. Domain + Resend DKIM + Search Console verification → [phase-7-checklist.md](phase-7-checklist.md).

**SEO baseline (code-only)**:

- [ ] `app/sitemap.ts` — generate sitemap dari static page + indexable route
- [ ] `app/robots.ts`:
  - Allow `/`, `/pricing`, `/help`, `/blog/*` (kalau ada)
  - Disallow `/app/*`, `/public/*`, `/login`, `/register`, `/verify-*`, `/reset-password/*`, `/invite/*`
- [ ] `metadata` API per public route: title (50-60 char), description (150-160 char), OG image, Twitter card
- [ ] `opengraph-image.tsx` dynamic untuk landing + public share preview
- [ ] Structured data JSON-LD untuk landing (Organization, FAQPage kalau ada)
- [ ] Canonical URL set (pakai placeholder host dari `NEXT_PUBLIC_APP_URL`)
- [ ] hreflang tag untuk `/id/*` + `/en/*` (kalau locale routing pakai prefix)
- [ ] Public share endpoint `/public/:token` set `X-Robots-Tag: noindex, nofollow`

**→ Phase 7**: Domain purchase, DNS, HTTPS provisioning, Resend DKIM/SPF/DMARC, Search Console verify, sitemap submit

**Acceptance**:
- [ ] Local: `http://localhost:3000/sitemap.xml` accessible
- [ ] Local: `http://localhost:3000/robots.txt` benar
- [ ] OG preview render benar (test via metadata route dengan tools opengraph.xyz pakai localhost tunnel kalau perlu)
- [ ] Lighthouse SEO score >95 di local build

---

### Group 6.12 — MVP Final Smoke + Handoff (Day 10 sore)

**Phase 6 (local)**: smoke test full flow di lokal + dokumentasi handoff. Production deploy + beta invite → [phase-7-checklist.md](phase-7-checklist.md).

- [ ] Help docs / FAQ minimal di `/help`
- [ ] Onboarding email template ready (verify, welcome, invitation) — sudah ada di `src/emails/`
- [ ] Final smoke test seluruh flow di local (register → workspace → invite → asset → valuation → share → public view)
- [ ] Sign off retro Phase 0-6 → handoff ke Phase 7

**Acceptance**:
- [ ] Full user journey local-only sukses end-to-end
- [ ] Build pass + lint clean
- [ ] Documentation complete (user FAQ + runbook)

---

## DoD Phase 6 / MVP Feature-Complete

- [ ] Empty/loading/error states everywhere
- [ ] Accessibility AA pass
- [ ] Performance budget met (local Lighthouse)
- [ ] Security audit pass (OWASP top 10)
- [ ] i18n ID + EN working
- [ ] Local backup procedure tested (pg_dump/restore)
- [ ] Monitoring hooks wired (event log + health endpoint)
- [ ] Privacy policy + ToS published
- [ ] Account settings working (including delete)
- [ ] Full user journey local end-to-end (register → workspace → invite → asset → valuation → share → public view)
- [ ] CI green
- [ ] Documentation complete (user-facing FAQ + internal runbook)
- [ ] Incident response plan documented
- [ ] **Production deploy + beta launch → [phase-7-checklist.md](phase-7-checklist.md)**

---

## Launch Day Checklist

- [ ] DB backup verified
- [ ] Monitoring dashboards bookmarked
- [ ] On-call rotation set (kalau team >1)
- [ ] Status page green
- [ ] DNS TTL low (300s) untuk easy rollback
- [ ] Rollback plan documented
- [ ] Press release / launch post draft
- [ ] Beta invite first 20 users
- [ ] Monitor Sentry + Vercel for 4 jam post-launch
- [ ] Slack channel #launch-day untuk realtime issue

---

## Out of Scope MVP / V2 Candidate

- Realtime collaboration (WebSocket / SSE)
- Auto-sync market price
- Transactions tabel & financial flow
- Approval workflow
- AI insights / forecasting
- Depreciation engine
- Public marketplace
- API key untuk third-party
- Mobile native app (React Native / Expo)
- Webhook outbound
- Custom domain per workspace
- White-label
- Enterprise SSO (SAML/OIDC)
- Self-host deployment
- Saved filter view (push V2 kalau tidak selesai P4)
- OCR attachment
- Bulk attachment download ZIP
- Notification center penuh
- Mobile push notification

---

## Risks

| Risk | Mitigation |
|---|---|
| Email deliverability post-launch | Warmup domain, monitor Resend bounce rate |
| Spike traffic crash | Vercel auto-scale, Neon scale plan ready |
| Critical bug post-launch | Rollback via Vercel one-click |
| Sentry false alarm flood | Tune sampling, rate limit alert |
| Beta user confusion | Onboarding email + help docs |
| Customer support overload | FAQ + email auto-reply with 24h SLA |
| Privacy complaint | Privacy policy live, audit log forensic |

---

## Changelog

- 0.2 — Group 6.11 reworked: domain + SEO setup explicit (custom domain mandatory karena `.vercel.app` noindex). Tambah sitemap/robots/metadata/Search Console checklist. Beta launch jadi 6.12.
- 0.1 — Initial Phase 6 launch checklist. 10-day plan, polish + ops + legal + launch.
