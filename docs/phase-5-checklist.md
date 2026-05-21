# Phase 5 — Public Sharing Checklist

# Collaborative Asset Workspace Platform

Version: 0.4
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md), [permission-matrix.md](permission-matrix.md)
Window: **Week 17–18** (10 working days)

## Status: ✅ Slicing complete (in-memory)

**Third-party**: Vercel edge cache + Upstash rate-limit dipindah ke [phase-7-checklist.md](phase-7-checklist.md). Phase 5 pakai HTTP cache header (`s-maxage`) + in-memory rate-limit.

- ✅ Group 5.1 Share store: createShare, updateExpiry, revokeShare + activity log per mutation
- ✅ Group 5.2 SharingManager UI di `/app/w/[slug]/sharing` — create dialog (workspace or asset scope, expiry preset), active list, revoked history, copy link
- ✅ Group 5.3 Public view route `/public/[token]` dengan status handling (invalid/revoked/expired/missing)
- ✅ Group 5.4 PublicView component: workspace scope (asset list dengan category + owner), asset scope (standalone with sub-asset list)
- ⏸ Group 5.5 Edge cache — backend wiring phase (Phase 7 swap ke Vercel edge cache)
- ⏸ Group 5.6 Security audit — backend wiring phase (token entropy + scope strip sudah di-implement di store)
- ✅ noindex via Next.js metadata robots set

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

- [x] `public_shares` Drizzle schema alive (Phase 0)
- [ ] **Backend (deferred)**: tRPC `sharing.create`
- [x] Generate 32-byte crypto-random token via `crypto.getRandomValues` di zustand store
- [x] Activity log per `createShare`
- [ ] **Backend (deferred)**: Rate limit 10/hour/workspace
- [ ] **Backend (deferred)**: Owner-only middleware

**Day 2: Manage shares**

- [ ] **Backend (deferred)**: tRPC `sharing.list` / `update` / `revoke`
- [x] Slicing: `useShareStore` dengan list/createShare/updateExpiry/revokeShare actions
- [x] Activity log per mutation

**Acceptance**:
- [x] Generate workspace share token panjang 32 byte base64url
- [x] Generate asset share with targetId validate asset exist di workspace
- [x] Update expiry future or unset (null = never)
- [x] Revoke immediate (revoked_at set, store update)
- [ ] Editor attempt sharing → 403 — Phase 2 role gate menyusul
- [ ] Rate limit — backend wiring phase

---

### Group 5.2 — Sharing Settings UI (Day 3–4)

**Day 3: List + create**

- [x] `/app/w/:slug/sharing` page (`sharing-manager.tsx`)
- [x] List active shares: scope badge, target info, token preview, expiry, created date
- [x] Copy link button (clipboard API)
- [x] Generate new link button
- [x] Modal create dengan scope + expiry preset + confirm warning

**Day 4: Manage**

- [x] Per-share action: Revoke (confirm via toast)
- [x] Revoked shares section (history list)
- [x] Copy link prominent UX
- [ ] QR code generator — defer V2

**Acceptance**:
- [x] Generate link → tampil di list dengan copy button
- [x] Click copy → toast "Copied" + clipboard valid
- [x] Revoke → list update + share inaccessible immediately
- [x] Mobile UI ergonomic

---

### Group 5.3 — Public Endpoint Backend (Day 5–6)

**Day 5: Token validator** (slicing via client-side helper)

- [ ] **Backend (deferred)**: REST endpoint `GET /api/public/:token`
- [x] Helper `validateShareToken(token)` di zustand store: find + check revoked + check expired
- [ ] **Backend (deferred)**: Rate limit 100/min/IP
- [x] No auth required (`/public/:token` route public)

**Day 6: Data shape per scope** (slicing)

- [x] Scope=workspace: PublicView render workspace name + asset list + by-category
- [x] Scope=asset: PublicView render single asset + sub-asset list
- [x] Strip: members, activity, attachments, notes, purchase price, internal IDs (PublicView only reads necessary fields)
- [ ] Convert internal IDs ke short slug — defer V2 (zustand IDs sudah random UUID)

**Acceptance**:
- [x] Valid token → render data sesuai scope
- [x] Expired token → "expired" status
- [x] Revoked token → "revoked" status
- [x] Invalid token → "invalid" status
- [x] Workspace scope tidak expose member emails
- [x] Asset scope tidak expose parent/breadcrumb

---

### Group 5.4 — Public View UI (Day 7–8)

**Day 7: Workspace scope view** (slicing)

- [x] `/public/:token` page (no auth, public route)
- [x] Client component fetch data dari zustand (backend wiring phase: server component cache 60s edge)
- [x] Layout: header (workspace name + "Read-only view"), total card, asset list, by-category list
- [ ] Asset row click → expand inline detail — defer V2
- [x] Footer: "Powered by Valbook"
- [x] No nav menu, no edit buttons

**Day 8: Asset scope view + polish**

- [x] Same `/public/:token` route, layout berbeda berdasarkan scope
- [x] Asset scope: standalone card layout, sub-asset section
- [x] Mobile: stacked responsive
- [x] Loading skeleton (zustand hydration)
- [x] Error page kalau token invalid/expired/revoked
- [x] noindex via Next.js metadata robots
- [ ] Open Graph meta tag — defer Phase 6 SEO group

**Acceptance**:
- [x] Visit valid workspace link → tampil data benar tanpa auth
- [x] Visit valid asset link → tampil 1 asset standalone
- [x] Visit invalid link → error page
- [x] No JS error di browser dev tools
- [x] Mobile responsive

---

### Group 5.5 — Edge Caching + Invalidation (Day 9)

- [ ] **Backend (deferred)**: HTTP cache header `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
- [ ] **Backend (deferred)**: Cache invalidation pada revoke via `cacheInvalidateByPattern('share:*')`
- [ ] **Backend (deferred)**: Cache invalidation pada workspace data change
- [ ] **Backend (deferred)**: Performance test 100 req/sec

**Acceptance** (backend wiring phase):
- [ ] 2nd request <50ms (local: HTTP 304; Phase 7: edge cache hit)
- [ ] After revoke, cache invalidate
- [ ] After asset update, public view reflect dalam <60s

**→ Phase 7**: Vercel `revalidateTag` + edge cache global propagation

---

### Group 5.6 — Security Audit (Day 10)

- [x] Token entropy verify (32 byte base64url ≈ 256 bits via `crypto.getRandomValues`)
- [ ] **Backend (deferred)**: Rate limit enforce dari IP via `checkRateLimit('publicShareView', ip)`
- [x] No internal IDs leaked di response (PublicView only reads minimal fields)
- [ ] **Backend (deferred)**: No SQL injection di token query (Drizzle parameterized)
- [ ] **Backend (deferred)**: CORS allow `*` untuk public endpoint
- [ ] **Backend (deferred)**: CSP header strict
- [x] No write endpoint exposed di public route (read-only PublicView)
- [x] Activity log mencatat semua share create/revoke (forensic)

---

## DoD Phase 5 (slicing)

- [x] Owner dapat generate + revoke + manage share link
- [x] Public view scope=workspace + scope=asset working
- [x] Anonymous access secure, scope-bound (read-only, minimal fields)
- [x] Token validation robust (expired/revoked/invalid handled)
- [x] No data leak via public endpoint
- [x] Mobile + desktop polish
- [x] CI green
- [ ] Cache hit + edge invalidation — backend wiring phase
- [ ] OG preview proper — Phase 6 SEO group

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

- 0.4 — Slicing items marked complete. Share store + SharingManager + PublicView semua green. Token entropy verified (32 byte base64url via `crypto.getRandomValues`). Backend tRPC + cache items annotated deferred.
- 0.3 — Vercel edge cache + Upstash moved to Phase 7.
- 0.2 — Slicing-first reorg.
- 0.1 — Initial Phase 5 checklist. 10-day plan, 7 stories.
