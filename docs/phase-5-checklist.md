# Phase 5 — Public Sharing Checklist

# Collaborative Asset Workspace Platform

Version: 0.3
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md), [permission-matrix.md](permission-matrix.md)
Window: **Week 17–18** (10 working days)

## Status: 🟡 Slicing complete (in-memory)

**Third-party**: Vercel edge cache + Upstash rate-limit dipindah ke [phase-7-checklist.md](phase-7-checklist.md). Phase 5 pakai HTTP cache header (`s-maxage`) + in-memory rate-limit.

- ✅ Group 5.1 Share store: createShare, updateExpiry, revokeShare
- ✅ Group 5.2 SharingManager UI di `/app/w/[slug]/sharing` — create dialog (workspace or asset scope, expiry preset), active list, revoked history, copy link
- ✅ Group 5.3 Public view route `/public/[token]` dengan status handling (invalid/revoked/expired/missing)
- ✅ Group 5.4 PublicView component: workspace scope (asset list dengan category + owner), asset scope (standalone with sub-asset list)
- 🟡 Group 5.5 Edge cache — deferred wiring phase
- 🟡 Group 5.6 Security audit — deferred wiring phase
- noindex via Next.js metadata robots set

---

## Overview

Phase 5 = visibility outside team. Output: owner dapat share workspace atau asset specific via public link (view-only, no auth) dengan expiry + revoke control.

**Acceptance gate ke Phase 6**: link sharing secure, scope-bound, performant untuk view by anonymous visitor.

---

## Stories covered

| Epic | Story IDs |
|---|---|
| Sharing | SHR-01..SHR-05 |
| Public View | PUB-01, PUB-02 |

Total: 7 stories (7 P0).

---

## Step Groups

### Group 5.1 — Share Backend (Day 1–2)

**Day 1: Schema + create**

- [ ] Verify `public_shares` schema alive
- [ ] tRPC `sharing.create({ workspaceSlug, scope, targetId?, expiresAt? })`
  - Validate scope=workspace OR scope=asset+targetId
  - Generate 32-byte crypto-random token (`crypto.randomBytes(32).toString('base64url')`)
  - Insert row
  - Activity log
- [ ] Rate limit: 10/hour/workspace
- [ ] Owner-only middleware

**Day 2: Manage shares**

- [ ] tRPC `sharing.list({ workspaceSlug })` return active shares dengan target info
- [ ] tRPC `sharing.update({ id, expiresAt })` update expiry
- [ ] tRPC `sharing.revoke({ id })` set `revoked_at = now()`
- [ ] Activity log

**Acceptance**:
- [ ] Generate workspace share token panjang 32 byte base64url
- [ ] Generate asset share with targetId validate asset exist + same workspace
- [ ] Update expiry future or unset (null = never)
- [ ] Revoke immediate (test 2nd request setelah revoke return 404)
- [ ] Editor attempt sharing → 403
- [ ] Rate limit hit setelah 10 → 429 dengan retry-after

---

### Group 5.2 — Sharing Settings UI (Day 3–4)

**Day 3: List + create**

- [ ] `/app/w/:slug/sharing` page (owner only access)
- [ ] List active shares: scope badge, target info (workspace name or asset name), token preview (first 8 char), expiry, created date
- [ ] Copy link button (clipboard API)
- [ ] Generate new link button
- [ ] Modal create:
  - Scope: workspace / asset (pick asset via search picker)
  - Expiry: never / 1 day / 7 days / 30 days / custom date
  - Confirm warning: "Anyone with the link can view"

**Day 4: Manage**

- [ ] Per-share action: Edit expiry, Revoke (confirm modal)
- [ ] Revoked shares section (history, last 30 days)
- [ ] Copy link prominent UX
- [ ] QR code generator for mobile sharing (qrcode library)

**Acceptance**:
- [ ] Generate link → tampil di list dengan copy button
- [ ] Click copy → toast "Copied" + clipboard valid
- [ ] Revoke → list update + share inaccessible immediately
- [ ] QR scan → buka public view URL
- [ ] Mobile UI ergonomic

---

### Group 5.3 — Public Endpoint Backend (Day 5–6)

**Day 5: Token validator**

- [ ] REST endpoint `GET /api/public/:token`
- [ ] Helper `validateShareToken(token)`:
  - Find share by token
  - Check `revoked_at IS NULL`
  - Check `expires_at IS NULL OR expires_at > now()`
  - Return `{ share, workspace, target? }` or null
- [ ] Rate limit: 100/min/IP
- [ ] No auth required

**Day 6: Data shape per scope**

- [ ] Scope=workspace:
  - Return: workspace name, displayCurrency, totalValue, assetCount
  - assets array (active only): id (slug), name, code, status, location, currentValue, currentCurrency, customFields, category name, ownerLabel name, tags
  - byCategory distribution
- [ ] Scope=asset:
  - Return only target asset detail (no workspace meta, no breadcrumb)
  - Sub-asset children (1 level only, name + value)
  - Latest valuation value only (no history)
- [ ] Convert internal IDs ke short slug (Hashids or similar)
- [ ] Strip: members, activity, attachments, notes, purchase price, internal IDs

**Acceptance**:
- [ ] Valid token → return data sesuai scope
- [ ] Expired token → 404 dengan generic error (jangan leak existence)
- [ ] Revoked token → 404
- [ ] Workspace scope tidak expose member emails
- [ ] Asset scope tidak expose parent/breadcrumb
- [ ] Response size reasonable (kompress JSON)

---

### Group 5.4 — Public View UI (Day 7–8)

**Day 7: Workspace scope view**

- [ ] `/public/:token` page (no auth, public route)
- [ ] Server component fetch data (cache 60s edge)
- [ ] Layout: header (workspace name + "Read-only view"), total card, asset list, by-category chart (simple)
- [ ] Asset row click → expand inline detail (no separate page)
- [ ] Footer: "Powered by Asset Workspace"
- [ ] No nav menu, no edit buttons, no auth prompts (unless user wants login)

**Day 8: Asset scope view + polish**

- [ ] Same `/public/:token` route, layout berbeda berdasarkan scope
- [ ] Asset scope: standalone card layout, sub-asset section
- [ ] Mobile: stacked, swipeable detail
- [ ] Loading skeleton
- [ ] Error page kalau token invalid (404 page generic)
- [ ] Open Graph meta tag (preview saat dishare di WA/Twitter)

**Acceptance**:
- [ ] Visit valid workspace link → tampil data benar tanpa auth
- [ ] Visit valid asset link → tampil 1 asset standalone
- [ ] Visit invalid link → 404 page
- [ ] No JS error di browser dev tools
- [ ] Lighthouse Performance >85
- [ ] OG meta tag preview render benar (test WA share)
- [ ] Mobile responsive

---

### Group 5.5 — Edge Caching + Invalidation (Day 9)

- [ ] HTTP cache header `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` di response `/api/public/:token` (local: browser cache; Phase 7: Vercel edge cache)
- [ ] Cache invalidation pada revoke: in-memory `cacheInvalidateByPattern('share:*')` (Phase 7: `revalidateTag(`share-${token}`)`)
- [ ] Cache invalidation pada workspace data change: tag asset + workspace updates dengan share token cache key
- [ ] Performance test: 100 req/sec sustain

**Acceptance**:
- [ ] 2nd request <50ms (local: HTTP 304; Phase 7: edge cache hit)
- [ ] After revoke, cache invalidate dalam <5s (local: instant single-process; Phase 7: globally)
- [ ] After asset update, public view reflect dalam <60s

**→ Phase 7**: Vercel `revalidateTag` + edge cache global propagation

---

### Group 5.6 — Security Audit (Day 10)

- [ ] Token entropy verify (256 bits)
- [ ] Rate limit enforce dari IP via `checkRateLimit('publicShareView', ip)` (local: in-memory; Phase 7: Upstash + `request.ip` behind Vercel proxy)
- [ ] No internal IDs leaked di response (grep + manual review)
- [ ] No SQL injection di token query (parameterized)
- [ ] CORS: allow `*` untuk public endpoint (read-only)
- [ ] CSP header strict
- [ ] No write endpoint exposed di public route
- [ ] Audit log mencatat semua share create/revoke (forensic)

---

## DoD Phase 5

- [ ] Owner dapat generate + revoke + manage share link
- [ ] Public view scope=workspace + scope=asset working
- [ ] Anonymous access secure, scope-bound
- [ ] Cache hit improve performance
- [ ] Token validation robust (expired/revoked/invalid handled)
- [ ] No data leak via public endpoint
- [ ] OG preview proper
- [ ] Mobile + desktop polish
- [ ] CI green

---

## Out of Scope Phase 5

- Password-protected share (V2)
- Share with edit permission (V2)
- Per-link content customization (hide notes, hide value) (V2)
- Share via email (just copy link MVP)
- Share analytics / view count (V2)
- Embeddable widget (V2)

---

## Risks

| Risk | Mitigation |
|---|---|
| Token guessing | 32-byte entropy, rate limit |
| Cache stale after revoke | Tag-based invalidation, fallback s-maxage 60 |
| Workspace owner accidentally share sensitive | Confirm modal + audit log + clear "anyone with link" warning |
| Public endpoint DDoS | Local: in-memory rate-limit; → Phase 7 (Cloudflare proxy + Vercel edge cache + Upstash) |
| SEO leak via crawled link | `X-Robots-Tag: noindex` + robots.txt deny `/public/*` |
| Internal ID leak via JSON | Short slug + explicit strip in serializer |

---

## Changelog

- 0.1 — Initial Phase 5 checklist. 10-day plan, 7 stories.
