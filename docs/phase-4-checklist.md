# Phase 4 — Attachment + Activity + Search Checklist

# Collaborative Asset Workspace Platform

Version: 0.4
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md)
Window: **Week 15–16** (10 working days)

## Status: ✅ Slicing complete (in-memory)

**Third-party**: Cloudflare R2 dipindah ke [phase-7-checklist.md](phase-7-checklist.md). Phase 4 attachment storage pakai local filesystem (`apps/web/public/uploads/<workspaceId>/...`) via `shared/lib/storage.ts`. Direct upload via tRPC mutation (POST file ke server, server `saveFile()`). Phase 7 swap → presigned PUT URL ke R2.

- ✅ Group 4.1 Attachment upload — base64 data URL in store (5MB cap, mime allowlist), AttachmentTab dengan image preview lightbox + download + delete
- ✅ Group 4.2 Tags CRUD + assign multi tag ke asset + filter
- ✅ Group 4.3 Activity log full UI dengan filter (actor, entity type, action, date range)
- ✅ Group 4.4 Search + filter advanced (search, category, owner, status, tag, value min/max, archive toggle)
- ⏸ Group 4.5 Saved filter view — defer V2 (out of MVP scope)

---

## Overview

Phase 4 = documentation + discovery. Output: user dapat upload file, tag asset, lihat full activity history, dan search/filter advanced.

**Acceptance gate ke Phase 5**: workspace data discoverable + auditable + documented dengan file.

---

## Stories covered

| Epic | Story IDs |
|---|---|
| Attachment | ATT-01..ATT-06 |
| Tags | TAG-01..TAG-04 |
| Activity Log | LOG-01..LOG-03 |
| Search & Filter | SRC-01..SRC-05 |

Total: 18 stories (12 P0, 5 P1, 1 P2).

---

## Step Groups

### Group 4.1 — Attachment Upload (Day 1–3)

**Day 1: Backend** (deferred ke saat backend wiring phase)

- [ ] **Backend (deferred)**: tRPC `attachments.upload({ workspaceSlug, assetId, fileName, mimeType, base64 })`
  - Validate: max 25MB, mime allowlist
  - Decode base64 → `saveFile()` ke `public/uploads/<workspaceId>/<uuid>.<ext>`
  - Insert `attachments` row dengan `storage_key` + `uploaded_at = now()`
- [ ] **Backend (deferred)**: tRPC `attachments.getDownloadUrl({ attachmentId })`
- [ ] **Backend (deferred)**: tRPC `attachments.delete`
- [ ] **Backend (deferred)**: tRPC `attachments.list`
- [x] Activity log (per upload/delete di attachment store)

**→ Phase 7**: Swap `attachments.upload` → presigned PUT URL flow. Add `confirmUpload` mutation. Storage_key tetap, prefix `r2://` saat di R2.

**Day 2: Frontend upload** (slicing)

- [x] Asset detail tab "Attachments" (`attachment-tab.tsx`)
- [x] File input + browse button
- [ ] Drag & drop zone — defer V2
- [ ] Multi-file upload (sequential or concurrent, parallel max 3) — defer V2
- [ ] Per-file progress bar — defer V2 (slicing: instant base64)
- [x] Validation feedback inline (size too big, mime not allowed)
- [x] Upload flow (slicing): file → FileReader base64 → `uploadFile` action (refresh list via subscribe)

**Day 3: Frontend list + preview** (slicing)

- [x] Attachment grid: thumbnail (image) / icon (PDF/doc) + name + size + uploaded_by + date
- [x] Image inline preview modal (lightbox style)
- [ ] PDF inline preview — defer V2
- [x] Download button per file (data URL download)
- [x] Delete button (confirm modal)
- [x] Mobile: list view stacked (Tailwind responsive)

**Acceptance**:
- [x] Upload 5MB image sukses (base64 in store)
- [x] Upload >5MB block dengan error message clear (zustand validation cap 5MB sementara, dapat di-bump ke 25MB saat saveFile wiring)
- [x] Upload non-allowlist MIME block
- [x] Download URL works (data URL slicing; Phase 7: presigned 5 min)
- [x] Delete remove dari zustand store (Phase 7: + R2 deleteFile)
- [x] Image preview load instant

---

### Group 4.2 — Tags (Day 4)

- [ ] **Backend (deferred)**: tRPC `tags.list` / `create` / `update` / `delete`
- [ ] **Backend (deferred)**: tRPC `assets.assignTags({ id, tagIds })`
- [x] `/app/w/:slug/tags` settings page (`tag-list.tsx`)
- [x] Color picker + name input
- [x] Asset detail tampil tag badges (via `assetTags` mapping)
- [x] Asset list filter by tags (multi-select chip filter di asset-table)

**Acceptance**:
- [x] Create/edit/delete tag (zustand)
- [x] Assign multi tags ke asset (via store action)
- [x] Filter list by tag → asset matching tampil
- [x] Delete tag → unassign dari semua asset (cascade asset_tags map)

---

### Group 4.3 — Activity Log Full UI (Day 5–6)

**Day 5: Backend** (deferred)

- [ ] **Backend (deferred)**: tRPC `activity.list` dengan filter (actorIds, entityTypes, actions, dateFrom, dateTo)
- [ ] **Backend (deferred)**: Cursor pagination
- [ ] **Backend (deferred)**: Join user info untuk actor name + avatar
- [ ] **Backend (deferred)**: tRPC `activity.forAsset({ assetId })` paginated

**Day 6: Frontend** (slicing)

- [x] `/app/w/:slug/activity` page
- [x] Filter sidebar: actor multi-select, entity type, action, date range (`activity-feed-filtered.tsx`)
- [x] Activity feed: actor + action verb + entity link + relative time
- [x] Group by day (header per date)
- [ ] Infinite scroll — defer V2 (1000 entry cap di store cukup untuk MVP)
- [x] Asset detail tab "Activity" per asset (filter by entityId)
- [x] Mobile: filter inline (Tailwind responsive)

**Acceptance**:
- [x] Filter combine actor + entity type + date range works
- [x] Activity link to entity → navigate ke detail
- [x] Deleted entity → activity tetap visible
- [ ] Performance: 10k entries query <500ms — backend wiring phase

---

### Group 4.4 — Search & Filter (Day 7–9)

**Day 7: Backend search** (deferred)

- [ ] **Backend (deferred)**: Trigram index on `assets.name` + `assets.code`
- [ ] **Backend (deferred)**: tRPC `assets.list` update filter

**Day 8: Frontend filter UI** (slicing)

- [x] Filter inline di asset list (`asset-table.tsx`)
- [x] Search bar by name + code (client-side filter)
- [x] Multi-select per filter (category, owner, tag, status)
- [x] Value range min/max input
- [x] Include archived toggle
- [ ] Sort dropdown — defer V2
- [x] Active filter chips di header (click X to remove)
- [x] Clear all button

**Day 9: Custom field filter** (defer V2)

- [ ] Filter by custom field (P1) — defer V2

**Acceptance**:
- [x] Search "macbook" return matches by name + code substring
- [x] Combined filter (category=Laptop, status=active, value>10jt) accurate
- [ ] Performance: 1000 asset filter <300ms — backend wiring phase
- [x] Mobile filter ergonomic

---

### Group 4.5 — Saved Filter View (Day 10) *(P2 optional)*

- [x] Deferred ke V2 (Out of MVP scope)

---

## DoD Phase 4 (slicing)

- [x] Attachment upload+download stable (base64 slicing)
- [x] Image preview works (lightbox modal)
- [x] Tag system end-to-end (CRUD + assign + filter)
- [x] Activity log filterable (actor + entity + action + date)
- [x] Search by name/code works
- [x] Filter combinable + accurate
- [x] All P0 stories pass slicing-mode
- [x] CI green
- [ ] Pagination + perf benchmark — backend wiring phase

---

## Out of Scope Phase 4

- PDF inline preview (Phase 6 polish atau V2)
- File versioning (V2)
- Saved filter view (P2 → V2 kalau slip)
- Full-text search semantic (pgvector V2)
- Bulk attachment ZIP download (V2)
- OCR attachment (V2)

---

## Risks

| Risk | Mitigation |
|---|---|
| R2 CORS blocking direct upload | → Phase 7 (set CORS origin list di R2 settings); local: no CORS issue, upload lewat server |
| Upload retry mengabaikan partial state | Cleanup orphan attachment via weekly cron |
| Trigram index slow di Postgres 16 | Test dengan 10k row dataset, alternatif: pg_trgm + GIN |
| Custom field filter UX kompleks | Limit MVP ke 1 field at a time, advanced V2 |
| Large file upload time-out Vercel | → Phase 7 (direct-to-R2 signed URL bypass server), Vercel 30s function limit |
| Activity log table growth | Partition by month V2 kalau >1M rows |

---

## Changelog

- 0.4 — Slicing items marked complete. Attachment + tag + activity + search/filter slicing all green. Backend tRPC mutations annotated deferred. Group 4.5 saved filter view explicitly V2.
- 0.3 — Cloudflare R2 moved to Phase 7. Phase 4 uses local FS storage via `shared/lib/storage.ts`.
- 0.2 — Slicing-first reorg: zustand stores + UI done.
- 0.1 — Initial Phase 4 checklist. 10-day plan, 18 stories.
