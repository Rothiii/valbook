# Phase 3 — Valuation + Dashboard Checklist

# Collaborative Asset Workspace Platform

Version: 0.2
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md)
Window: **Week 13–14** (10 working days)

## Status: 🟡 Slicing complete (in-memory)

Slicing-first workflow. Backend wiring deferred.

- ✅ Group 3.1 Valuation entry (CRUD + activity log + auto-update asset current value)
- ✅ Group 3.2 Valuation chart (recharts Line chart, needs ≥2 entries)
- ✅ Group 3.3 CSV bulk import (papaparse + preview + validate per row)
- 🟡 Group 3.4 Currency rate backend (in-memory rates store with builtin seed + manual upsert; no cron)
- ✅ Group 3.5 Dashboard aggregation (converted total via display currency + unsupported warning)
- 🟡 Group 3.6 Currency display settings (display_currency editable di workspace settings — Phase 1 done; per-asset toggle defer)

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

- [ ] tRPC `valuation.create` (value, currency, valuedAt, note, customFields)
- [ ] Update `assets.current_value` + `current_currency` + `current_value_updated_at` (kalau valuedAt >= existing)
- [ ] tRPC `valuation.update` / `valuation.delete`
- [ ] Recalculate `current_value` setelah delete latest entry (fall back ke entry sebelumnya)
- [ ] tRPC `valuation.list` per asset paginated
- [ ] Activity log

**Day 2: Frontend**

- [ ] Asset detail tab "Valuation"
- [ ] Add entry button → modal: value + currency + date + note
- [ ] Valuation table: date, value, currency, note, source badge
- [ ] Edit + Delete row action
- [ ] Empty state CTA

**Acceptance**:
- [ ] Add entry update `current_value` benar
- [ ] Delete latest entry fall back ke entry kedua (verify)
- [ ] Add backdate entry tidak override current
- [ ] Editor only mutation, viewer read

---

### Group 3.2 — Valuation Chart (Day 3)

- [ ] tRPC `valuation.chart({ assetId, range: "1m" | "3m" | "1y" | "all" })`
- [ ] Server query: group by valued_at, return points
- [ ] Frontend: Recharts line chart di valuation tab
- [ ] Range selector tabs
- [ ] Convert ke `display_currency` opsional (user toggle)
- [ ] Mobile responsive chart

**Acceptance**:
- [ ] Chart accurate vs raw data
- [ ] Empty state kalau <2 entry
- [ ] Range switch update view
- [ ] Currency converted tampil keterangan exchange rate date

---

### Group 3.3 — CSV Bulk Import (Day 4–6)

**Day 4: Parser + validator**

- [ ] CSV parser library (papaparse)
- [ ] tRPC `valuation.bulkImportPreview({ csvBase64 })` → return rows dengan status
- [ ] Per row validate:
  - asset_code valid + exist di workspace
  - value numeric > 0
  - currency exist di `currencies`
  - valued_at parseable ISO 8601
- [ ] Return preview `[{ row, asset, value, status: "ok" | "error", error?: string }]`
- [ ] Error report download (CSV)

**Day 5: Preview UI**

- [ ] Import button di valuation page atau asset list
- [ ] Drop CSV or click upload
- [ ] Preview modal: table dengan status badge per row, total ok/error
- [ ] Action: download error report, skip errors & import, cancel

**Day 6: Confirm import**

- [ ] tRPC `valuation.bulkImportConfirm({ validRows, idempotencyKey })`
- [ ] Batch insert dalam transaction (chunk 500 rows)
- [ ] Recompute `current_value` per affected asset
- [ ] Activity log: 1 entry per asset dengan action `bulk_import`
- [ ] Success summary: insertedCount, failedCount

**Acceptance**:
- [ ] Import 100 rows valid → semua masuk dalam <5s
- [ ] Import 100 rows campur error → preview tampil benar, skip errors works
- [ ] Idempotency key prevent dupe submit
- [ ] `current_value` per asset accurate setelah import
- [ ] Activity log entry per asset

---

### Group 3.4 — Currency Rate Backend (Day 7)

- [ ] Cron rate-refresh harden:
  - Fetch fiat dari frankfurter.app (base EUR or USD)
  - Fetch crypto dari CoinGecko (top 50 list)
  - Upsert dengan `valid_from = now()`, `source = 'api'`
  - Handle API failure gracefully (log, retry next cycle)
- [ ] tRPC `currency.getRates({ baseCurrency })` query latest per pair
- [ ] tRPC `currency.manualOverride({ workspaceSlug, from, to, rate })` — workspace-scoped manual rate
- [ ] Helper `convertCurrency(amount, from, to, atDate?)` → use manual if exist, else API rate

**Acceptance**:
- [ ] Cron run manual sukses, populate ≥30 currency rate
- [ ] Manual override per workspace tidak affect workspace lain
- [ ] Convert helper akurat (test fiat↔fiat, fiat↔crypto)

---

### Group 3.5 — Dashboard Aggregations (Day 8–9)

**Day 8: Backend queries**

- [ ] tRPC `dashboard.overview({ workspaceSlug })`:
  - sum(current_value converted) untuk archived_at IS NULL
  - assetCount
  - growthPercent1M (compare last month total)
  - ratesAvailable flag per currency missing
- [ ] tRPC `dashboard.byCategory` → array `{ categoryId, name, value, count, percent }`
- [ ] tRPC `dashboard.byOwner` → array `{ ownerLabelId, name, value, count, percent }`
- [ ] tRPC `dashboard.growth({ range })` → array `{ date, value }` (monthly aggregation)
- [ ] tRPC `dashboard.recentActivity` → last 10 activity entries
- [ ] Cache 1 menit di Upstash per workspace

**Day 9: Frontend**

- [ ] Replace skeleton dashboard dari Phase 1 dengan real charts
- [ ] Stat cards: total value, asset count, growth %
- [ ] Pie chart by category (Recharts)
- [ ] Pie chart by owner
- [ ] Line chart growth (12 month range default)
- [ ] Recent activity feed (last 10) dengan link ke entity
- [ ] Mobile: stacked cards, charts full-width

**Acceptance**:
- [ ] Total sum accurate vs manual DB query
- [ ] Distribusi percent total 100%
- [ ] Growth chart smooth tanpa gap
- [ ] Rate missing warning banner tampil kalau ada
- [ ] Cache hit detected setelah 2nd load
- [ ] Mobile chart readable

---

### Group 3.6 — Currency Display Settings (Day 10)

- [ ] Workspace settings: change `display_currency`
- [ ] All dashboard + asset list value displayed in display_currency
- [ ] Asset detail tampilkan original currency + converted display currency
- [ ] Rate timestamp tooltip ("rate fetched 2h ago")

**Acceptance**:
- [ ] Change display_currency immediate effect (cache invalidate)
- [ ] All values convert benar
- [ ] No NaN / undefined kalau rate missing → warning + original currency only

---

## DoD Phase 3

- [ ] Valuation manual + bulk import working
- [ ] Dashboard accurate per workspace
- [ ] Multi-currency conversion robust
- [ ] Cron rate refresh stable
- [ ] Cache invalidation correct
- [ ] All P0 stories pass
- [ ] Performance: dashboard load <1.5s cold, <500ms warm
- [ ] CI green

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

- 0.1 — Initial Phase 3 checklist. 10-day plan, 15 stories.
