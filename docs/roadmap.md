# MVP Roadmap — Master Index

# Collaborative Asset Workspace Platform

Version: 0.1
Source: [prd.md](../prd.md) + 7 supporting docs
Total window: **20 minggu (~5 bulan)** to customer-ready MVP

---

## Phase Overview

| Phase | Window | Focus | Doc |
|---|---|---|---|
| **0** | Week 1–2 | Foundation & infra setup | [phase-0-checklist.md](phase-0-checklist.md) |
| **1** | Week 3–7 | MVP Core (auth, workspace, asset CRUD, static category) | [phase-1-checklist.md](phase-1-checklist.md) |
| **2** | Week 8–12 | Dynamic fields + collaboration + hierarchy | [phase-2-checklist.md](phase-2-checklist.md) |
| **3** | Week 13–14 | Valuation history + dashboard + multi-currency | [phase-3-checklist.md](phase-3-checklist.md) |
| **4** | Week 15–16 | Attachment + tags + activity log UI + search | [phase-4-checklist.md](phase-4-checklist.md) |
| **5** | Week 17–18 | Public sharing (workspace + asset scope) | [phase-5-checklist.md](phase-5-checklist.md) |
| **6** | Week 19–20 | Polish, security, launch readiness | [phase-6-checklist.md](phase-6-checklist.md) |

---

## Dependency Graph

```
Phase 0 (Foundation)
   │
   ▼
Phase 1 (MVP Core)
   │   ── activity log writer ──┐
   ▼                            │
Phase 2 (Dynamic + Collab)      │
   │                            │
   ├── dynamic schema           │
   └── members                  │
   │                            │
   ▼                            │
Phase 3 (Valuation + Dashboard)─┤
   │                            │
   ├── multi-currency cache     │
   ▼                            │
Phase 4 (Attachment + Search)───┤
   │                            │
   ├── attachment infra         │
   ▼                            │
Phase 5 (Public Sharing)────────┤
   │                            │
   ▼                            │
Phase 6 (Polish + Launch)◄──────┘
```

---

## Critical Path

Yang paling load-bearing:

1. **Phase 0 → Phase 1** — DB schema + auth wajib kokoh sebelum CRUD
2. **Phase 1 activity log writer → all later phases** — dipakai semua mutasi
3. **Phase 2 dynamic schema → Phase 3 dashboard query** — dashboard butuh consistent schema
4. **Phase 2 membership → Phase 5 sharing permission** — role gate ke sharing
5. **Phase 3 multi-currency → Phase 5 public view** — public view tampil converted value
6. **Phase 4 search → Phase 6 polish** — search performance perlu optimize awal
7. **Phase 5 → Phase 6 security audit** — sharing endpoint paling sensitif

---

## Story Counts Per Phase

| Phase | P0 | P1 | P2 | Total |
|---|---:|---:|---:|---:|
| 0 — Foundation | — | — | — | (setup, no story) |
| 1 — MVP Core | 12 | 4 | 1 | 17 |
| 2 — Dynamic + Collab | 14 | 3 | 0 | 17 |
| 3 — Valuation + Dashboard | 10 | 5 | 0 | 15 |
| 4 — Attachment + Search | 12 | 5 | 1 | 18 |
| 5 — Sharing | 7 | 0 | 0 | 7 |
| 6 — Polish + Launch | (operational tasks) | | | – |
| **Total** | **55** | **17** | **2** | **74** |

---

## Time Budget Breakdown

| Phase | Days | Buffer included |
|---|---:|---|
| 0 | 10 | Day 10 |
| 1 | 25 | Day 23–25 |
| 2 | 25 | Day 23–25 |
| 3 | 10 | Last day partial |
| 4 | 10 | Last day partial |
| 5 | 10 | Day 9–10 |
| 6 | 10 | Day 10 morning |
| **Total** | **100 days = 20 weeks** | |

---

## Gate Criteria Per Phase

### Phase 0 → 1
- [ ] User can register, verify, login, create workspace from template
- [ ] CI/CD pipeline green
- [ ] All infra connected (DB, R2, Resend, Sentry, Upstash)

### Phase 1 → 2
- [ ] Solo user can full CRUD asset with static categories
- [ ] Activity log captures all mutations
- [ ] Mobile + desktop polished

### Phase 2 → 3
- [ ] Multi-user collaboration works (invite → accept → role)
- [ ] Dynamic field per category functional
- [ ] Hierarchy 5 depth supported
- [ ] Permission test 100% green

### Phase 3 → 4
- [ ] Valuation manual + CSV import works
- [ ] Dashboard accurate multi-currency
- [ ] Currency rates auto-refresh stable

### Phase 4 → 5
- [ ] Attachment upload/download stable
- [ ] Activity log filter UI complete
- [ ] Search & filter combinable

### Phase 5 → 6
- [ ] Public sharing secure + scope-bound
- [ ] Token validation robust
- [ ] No data leak via public endpoint

### Phase 6 → Launch
- [ ] Security audit pass (OWASP top 10)
- [ ] Performance budget met
- [ ] Backup tested + restorable
- [ ] Monitoring + alerting active
- [ ] Privacy policy + ToS published
- [ ] Account settings + delete works
- [ ] Production stable >48h
- [ ] Beta user complete journey

---

## Risk Hot Spots

| Phase | Risk | Impact |
|---|---|---|
| 0 | Better-auth Drizzle adapter quirks | Phase 1 delay |
| 1 | Activity log writer drift | Audit gap risk |
| 2 | Email deliverability | Member invitation fail |
| 2 | Hierarchy circular ref | Data integrity |
| 3 | CSV import perf large file | UX block |
| 3 | Currency rate API quota | Dashboard inaccurate |
| 4 | R2 CORS misconfig | Upload broken |
| 4 | Search trigram perf 10k+ rows | List slow |
| 5 | Token entropy / cache stale | Security breach |
| 6 | First customer onboarding friction | Launch impression |

---

## Decision Log Quick Reference

Decisions yang sudah dipinkan di docs:

| Topik | Pilihan | Source doc |
|---|---|---|
| Auth | better-auth | tech-stack 2.x |
| Owner per workspace | Single | permission-matrix 1 |
| Owner label | Free string master | erd 0.2 changelog |
| Multi-currency | API seed (frankfurter+CoinGecko, 6h refresh) | erd 4 |
| Transactions | V2 deferred | erd 2.12 |
| Workspace template | 6 builtin + Blank | erd 2.19 |
| Dashboard archived | Exclude default | permission |
| Child asset category | Boleh beda dari parent | erd 7 |
| Valuation entry | Manual + CSV bulk import | mvp-stories VAL-05 |
| API stack | tRPC internal + REST public | api-design 1 |
| Pagination | Cursor-based | api-design 6 |
| Validation | Zod shared schema | api-design 5 |
| Concurrency | Optimistic (no locking MVP) | api-design 9 |
| Public share | Hide attachment, member, activity, internal ID | permission 4 |
| Sharing create | Owner-only | permission 3.9 |
| Activity log | Immutable | permission 3.8 |
| Hosting | Vercel | tech-stack 2.1 |
| DB | Neon | tech-stack 2.2 |
| Storage | Cloudflare R2 | tech-stack 2.3 |
| Email | Resend + React Email | tech-stack 2.4 |
| Monitoring | Sentry | tech-stack 2.5 |
| Analytics | Vercel Analytics | tech-stack 2.6 |
| Cache + RL | Upstash Redis | tech-stack 2.7 |
| Jobs | Vercel Cron | tech-stack 2.8 |
| Mobile priority | Equal (desktop + mobile) | tech-stack 3.1 |
| Onboarding | Empty state CTAs only | tech-stack 3.2 |
| Asset code | Per workspace, nullable, unique when present | tech-stack 4.1 |
| View tracking | Skip MVP | tech-stack 4.2 |
| User ID | text (better-auth standard) | erd 0.5 |

---

## V2 Roadmap (Post-MVP)

Tidak dijabarkan detail, but in scope post-launch:

- Realtime collaboration (presence, live cursor)
- Transactions tabel + financial flow + accounting basics
- Auto-sync market price (broker integration, CoinGecko full)
- Notification center (in-app + push + digest email)
- Saved filter view + custom dashboard
- Multi-owner workspace
- Custom role definition
- Approval workflow
- AI insights (anomaly detection, forecasting)
- Depreciation engine
- Public marketplace / discover
- API key + third-party integration
- Webhook outbound
- Mobile native app (Expo)
- Self-host deployment option
- Enterprise SSO (SAML/OIDC)
- White-label
- OCR attachment
- pgvector full-text search semantic

---

## Reading Order (untuk team baru)

1. [prd.md](../prd.md) — product vision
2. [mvp-stories.md](mvp-stories.md) — user stories detail
3. [erd.md](erd.md) — database design
4. [api-design.md](api-design.md) — endpoint contract
5. [permission-matrix.md](permission-matrix.md) — auth/authz rules
6. [ux-flows.md](ux-flows.md) — user journey + screen mockup
7. [tech-stack.md](tech-stack.md) — infra & stack decisions
8. [phase-0-checklist.md](phase-0-checklist.md) — start coding
9. Follow phase sequentially

---

## Changelog

- 0.1 — Initial roadmap master index. 7 phase docs cross-linked. 20-week plan to customer-ready MVP.
