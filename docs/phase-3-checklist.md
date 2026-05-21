# Phase 3 — Valuation + Dashboard Checklist

# Collaborative Asset Workspace Platform

Version: 0.4
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md)
Window: **Week 13–14** (10 working days)

## Status: ✅ Slicing complete (in-memory)

Slicing-first workflow. Backend wiring deferred ke saat semua phase selesai.

**Third-party**: Frankfurter + CoinGecko (live rate fetch) dan Upstash (dashboard cache) dipindah ke [phase-7-checklist.md](phase-7-checklist.md). Phase 3 backend pakai builtin seed rates JSON + workspace manual override + in-memory cache (sudah ada di `shared/lib/cache.ts`). Phase 7 swap cache ke Upstash + cron live fetch.

- ✅ Group 3.1 Valuation entry (CRUD + activity log + auto-update asset current value)
- ✅ Group 3.2 Valuation chart (recharts Line chart, needs ≥2 entries, optional convert ke display currency)
- ✅ Group 3.3 CSV bulk import (papaparse + preview + validate per row)
- ✅ Group 3.4 Currency rate backend (in-memory rates store: 8 builtin currencies + seed rates + manual upsert + 2-hop convert helper)
- ✅ Group 3.5 Dashboard aggregation (converted total + by-category + by-owner + recent activity + growth 1M card)
- ✅ Group 3.6 Currency display settings (display_currency editable di workspace settings — dashboard + valuation chart respect it)

---

## Overview

Phase 3 = financial visibility. Output: user dapat track perubahan nilai aset over time + lihat aggregated dashboard. **No attachment, no advanced search**.

**Acceptance gate ke Phase 4**: dashboard tampilkan total + distribusi + growth chart akurat dengan multi-currency.

---

## Stories covered

| Epic | Story IDs |
|---|---|
| Valuation | VAL-01..VAL-05 |
| Dashboard | DASH-01..DASH-07 |
| Currency | CUR-01..CUR-03 |

Total: 15 stories (10 P0, 5 P1).

---

## Step Groups

### Group 3.1 — Valuation Entry (Day 1–2)

**Day 1: Backend**

- [ ] **Backend (deferred)**: tRPC `valuation.create` (value, currency, valuedAt, note, customFields)
- [x] Update `assets.current_value` + `current_currency` + `current_value_updated_at` (zustand `recomputeCurrentValue` di valuation/store.ts)
- [ ] **Backend (deferred)**: tRPC `valuation.update` / `valuation.delete`
- [x] Recalculate `current_value` setelah delete latest entry (fall back ke entry sebelumnya)
- [ ] **Backend (deferred)**: tRPC `valuation.list` per asset paginated
- [x] Activity log (`writeActivity` per mutation di valuation store)

**Day 2: Frontend**

- [x] Asset detail tab "Valuation" (`valuation-tab.tsx`)
- [x] Add entry button → modal: value + currency + date + note (`valuation-form.tsx`)
- [x] Valuation table: date, value, currency, note, source badge
- [x] Delete row action
- [x] Empty state CTA

**Acceptance**:
- [x] Add entry update `current_value` benar
- [x] Delete latest entry fall back ke entry kedua (recomputeCurrentValue)
- [x] Add backdate entry tidak override current (sort by valuedAt desc, latest wins)
- [ ] Editor only mutation, viewer read (Phase 2 role gate menyusul)

---

### Group 3.2 — Valuation Chart (Day 3)

- [ ] **Backend (deferred)**: tRPC `valuation.chart({ assetId, range: "1m" | "3m" | "1y" | "all" })`
- [x] Frontend: Recharts line chart di valuation tab (`valuation-chart.tsx`)
- [ ] Range selector tabs (defer V2)
- [x] Convert ke `display_currency` opsional (user toggle)
- [x] Mobile responsive chart (ResponsiveContainer)

**Acceptance**:
- [x] Chart accurate vs raw data
- [x] Empty state kalau <2 entry
- [x] Currency converted tampil warning kalau rate missing

---

### Group 3.3 — CSV Bulk Import (Day 4–6)

**Day 4: Parser + validator**

- [x] CSV parser library (papaparse) installed
- [ ] **Backend (deferred)**: tRPC `valuation.bulkImportPreview({ csvBase64 })` → return rows dengan status
- [x] Per row validate (client-side):
  - asset_code valid + exist di workspace
  - value numeric > 0
  - currency exist di `currencies`
  - valued_at parseable ISO 8601
- [x] Return preview `[{ row, asset, value, status: "ok" | "error", error?: string }]`
- [ ] Error report download (CSV) — defer V2

**Day 5: Preview UI**

- [x] Import button di valuation page atau asset list (`csv-import-dialog.tsx`)
- [x] Drop CSV or click upload
- [x] Preview modal: table dengan status badge per row, total ok/error
- [x] Action: skip errors & import, cancel

**Day 6: Confirm import**

- [ ] **Backend (deferred)**: tRPC `valuation.bulkImportConfirm({ validRows, idempotencyKey })`
- [x] Batch insert (`bulkImport` action di valuation store)
- [x] Recompute `current_value` per affected asset
- [x] Activity log: 1 entry per asset dengan action `bulk_import`
- [x] Success summary: insertedCount

**Acceptance**:
- [x] Import valid rows → masuk dalam <5s
- [x] Import campur error → preview tampil benar, skip errors works
- [x] `current_value` per asset accurate setelah import
- [x] Activity log entry per asset

---

### Group 3.4 — Currency Rate Backend (Day 7)

**MVP (Phase 3): builtin seed only**
- [x] Builtin seed rates di-load saat zustand store init (8 currencies: IDR, USD, EUR, SGD, JPY, BTC, ETH, USDT + seed rates pair)
- [ ] **Backend (deferred)**: tRPC `currency.getRates({ baseCurrency })` query latest per pair
- [ ] **Backend (deferred)**: tRPC `currency.manualOverride({ workspaceSlug, from, to, rate })` — workspace-scoped manual rate
- [x] Helper `convertCurrency(amount, from, to)` dengan 2-hop pivot via base currency (di currency store)
- [x] Cron stub di Phase 0 jalan tapi gak fetch live (TODO Phase 7)

**Acceptance**:
- [x] Seed populate currency rate untuk 8 pasangan
- [x] Convert helper akurat (test fiat↔fiat, fiat↔crypto via pivot)

**→ Phase 7**: Live rate fetch dari frankfurter.app (fiat) + CoinGecko (crypto) via cron `0 */6 * * *` (Vercel)

---

### Group 3.5 — Dashboard Aggregations (Day 8–9)

**Day 8: Backend queries**

- [ ] **Backend (deferred)**: tRPC `dashboard.overview({ workspaceSlug })`:
  - sum(current_value converted) untuk archived_at IS NULL
  - assetCount
  - growthPercent1M (compare last month total)
  - ratesAvailable flag per currency missing
- [ ] **Backend (deferred)**: tRPC `dashboard.byCategory` → array `{ categoryId, name, value, count, percent }`
- [ ] **Backend (deferred)**: tRPC `dashboard.byOwner` → array `{ ownerLabelId, name, value, count, percent }`
- [ ] **Backend (deferred)**: tRPC `dashboard.growth({ range })` → array `{ date, value }` (monthly aggregation)
- [ ] **Backend (deferred)**: tRPC `dashboard.recentActivity` → last 10 activity entries
- [ ] Cache 1 menit per workspace (in-memory `cacheOrFetch`; Upstash → Phase 7) — wiring saat backend

**Day 9: Frontend**

- [x] Replace skeleton dashboard dari Phase 1 dengan real data (app/app/w/[slug]/page.tsx)
- [x] Stat cards: total value, asset count, growth 1M (`useWorkspaceGrowth` hook)
- [x] By-category breakdown list (count per category sorted desc)
- [x] By-owner breakdown list (count per owner sorted desc)
- [ ] Line chart growth (12 month range default) — defer V2, growth card sufficient untuk MVP
- [x] Recent activity feed (last 10) dengan link ke entity (`ActivityFeed` component)
- [x] Mobile: stacked cards, charts full-width (Tailwind grid responsive)

**Acceptance**:
- [x] Total sum accurate (sum dari per-currency convert ke display)
- [x] Per-category + per-owner count accurate
- [x] Growth 1M percent + delta calc dari valuation history
- [x] Rate missing warning banner tampil kalau ada
- [x] Mobile chart readable

---

### Group 3.6 — Currency Display Settings (Day 10)

- [x] Workspace settings: change `display_currency` (`/app/w/[slug]/settings`)
- [x] Dashboard total value displayed in display_currency
- [x] Asset detail tampilkan original currency (Phase 1 sudah)
- [x] Valuation chart optional convert ke display currency (toggle di valuation-tab)
- [ ] Rate timestamp tooltip — defer V2

**Acceptance**:
- [x] Change display_currency immediate effect (zustand subscribe)
- [x] All values convert benar
- [x] No NaN / undefined kalau rate missing → warning + original currency only

---

## DoD Phase 3 (slicing)

- [x] Valuation manual + bulk import working (zustand)
- [x] Dashboard accurate per workspace (stat cards + growth + by-category + by-owner + activity feed)
- [x] Multi-currency conversion robust (2-hop pivot, missing rate warning)
- [x] All P0 stories pass slicing-mode
- [x] CI green
- [ ] Cron rate refresh stable — Phase 7
- [ ] Cache invalidation correct — backend wiring phase
- [ ] Performance: dashboard load <1.5s cold, <500ms warm — backend wiring phase

---

## Out of Scope Phase 3

- Auto-sync market price per asset (V2)
- Forecasting / prediction (V2)
- Drilling down chart segments (Phase 4 search filter)
- Export dashboard (V2)

---

## Risks

| Risk | Mitigation |
|---|---|
| CSV import slow >10k rows | Chunk + stream, return progress |
| Currency conversion off-by-rounding | Use NUMERIC throughout, format only at display |
| Cron rate API quota exhausted | Cache aggressive, alert kalau rate not refreshed >12h |
| Dashboard query N+1 | Single SQL with CTEs, benchmark before ship |
| Idempotency key collision | UUID v4 client-side |

---

## Changelog

- 0.4 — Slicing items marked complete. Dashboard Growth 1M card wired via `useWorkspaceGrowth` hook (computes percent + delta from valuation history vs 30d-ago baseline). Valuation chart gains optional convert-to-display-currency toggle with missing-rate warning. Currency rate backend (3.4) + display settings (3.6) status flipped to ✅ since zustand store covers all slicing needs.
- 0.3 — Third-party (Frankfurter, CoinGecko, Upstash) moved to Phase 7. Phase 3 backend uses seed rates + in-memory cache.
- 0.2 — Slicing-first reorg: zustand stores + UI done, backend deferred.
- 0.1 — Initial Phase 3 checklist. 10-day plan, 15 stories.
