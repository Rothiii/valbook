# Phase 4 — Attachment + Activity + Search Checklist

# Collaborative Asset Workspace Platform

Version: 0.1
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md)
Window: **Week 15–16** (10 working days)

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

**Day 1: Backend**

- [ ] tRPC `attachments.requestUploadUrl({ workspaceSlug, assetId, fileName, mimeType, sizeBytes })`
  - Validate: max 25MB, mime allowlist (image/*, application/pdf, doc/docx, xls/xlsx)
  - Insert `attachments` row dengan status `pending`
  - Return R2 presigned PUT URL (10 min) + attachmentId
- [ ] tRPC `attachments.confirmUpload({ attachmentId })` → mark `uploaded_at`, validate file exists di R2 (HEAD request)
- [ ] tRPC `attachments.getDownloadUrl({ attachmentId })` → presigned GET (5 min)
- [ ] tRPC `attachments.delete` → delete R2 + delete row
- [ ] tRPC `attachments.list({ workspaceSlug, assetId? })`
- [ ] Activity log

**Day 2: Frontend upload**

- [ ] Asset detail tab "Attachments"
- [ ] Drag & drop zone + browse button
- [ ] Multi-file upload (sequential or concurrent, parallel max 3)
- [ ] Per-file progress bar
- [ ] Validation feedback inline (size too big, mime not allowed)
- [ ] Upload flow: requestUploadUrl → PUT to R2 → confirmUpload → refresh list

**Day 3: Frontend list + preview**

- [ ] Attachment grid: thumbnail (image) / icon (PDF/doc) + name + size + uploaded_by + date
- [ ] Image inline preview modal (lightbox style)
- [ ] PDF inline preview (defer P2 — Phase 6 polish atau V2)
- [ ] Download button per file
- [ ] Delete button (editor + admin)
- [ ] Mobile: list view stacked

**Acceptance**:
- [ ] Upload 5MB image sukses, <5s
- [ ] Upload >25MB block dengan error message clear
- [ ] Upload .exe (mime not allowed) block
- [ ] Download URL works dan expire 5 min later
- [ ] Delete remove dari R2 + DB
- [ ] Multi-upload sequential progress visible
- [ ] Image preview load instant (cached signed URL 5 min)

---

### Group 4.2 — Tags (Day 4)

- [ ] tRPC `tags.list` / `create` / `update` / `delete`
- [ ] tRPC `assets.assignTags({ id, tagIds })` (replace all)
- [ ] `/app/w/:slug/tags` settings page
- [ ] Color picker + name input
- [ ] Asset form: multi-select tags (combobox)
- [ ] Asset detail tampil tag badges
- [ ] Asset list filter by tags (multi-select)

**Acceptance**:
- [ ] Editor create/edit/delete tag
- [ ] Assign multi tags ke asset
- [ ] Filter list by tag → asset matching tampil
- [ ] Delete tag → unassign dari semua asset (cascade asset_tags)

---

### Group 4.3 — Activity Log Full UI (Day 5–6)

**Day 5: Backend**

- [ ] tRPC `activity.list` dengan filter (actorIds, entityTypes, actions, dateFrom, dateTo)
- [ ] Cursor pagination
- [ ] Join user info untuk actor name + avatar
- [ ] tRPC `activity.forAsset({ assetId })` paginated

**Day 6: Frontend**

- [ ] `/app/w/:slug/activity` page
- [ ] Filter sidebar: actor multi-select, entity type, action, date range
- [ ] Activity feed: avatar + actor + action verb + entity link + relative time
- [ ] Group by day (header per date)
- [ ] Infinite scroll
- [ ] Asset detail tab "Activity" full list per asset
- [ ] Mobile: filter as modal/drawer

**Acceptance**:
- [ ] Filter combine actor + entity type + date range works
- [ ] Activity link to entity → navigate ke detail
- [ ] Pagination smooth
- [ ] Deleted entity → activity tetap visible tapi link disable
- [ ] Performance: 10k entries query <500ms with proper index

---

### Group 4.4 — Search & Filter (Day 7–9)

**Day 7: Backend search**

- [ ] Trigram index on `assets.name` + `assets.code`
- [ ] tRPC `assets.list` update filter:
  - `search`: ILIKE + trigram similarity ranking
  - `categoryIds`, `ownerLabelIds`, `statuses`, `tagIds` (multi-select)
  - `valueMin`, `valueMax`, `valueCurrency` (convert ke display untuk filter)
  - `customFields`: jsonb contains query
  - `includeArchived` default false
  - `sortBy`: name | createdAt | currentValue, `sortDir`: asc | desc
- [ ] Optimize query: combine where clauses, use indexes

**Day 8: Frontend filter UI**

- [ ] Filter sidebar di asset list (desktop) / drawer (mobile)
- [ ] Search bar dengan debounce (300ms)
- [ ] Multi-select chips per filter (category, owner, tag, status)
- [ ] Value range slider + currency selector
- [ ] Include archived toggle
- [ ] Sort dropdown
- [ ] Active filter chips di header (click X to remove)
- [ ] Clear all button

**Day 9: Custom field filter**

- [ ] Filter by custom field (P1) — UI: pick field → operator → value
- [ ] Backend: build jsonb query (e.g. `customFields->>'chip' = 'M3'`)
- [ ] Support per field type:
  - text: equals / contains
  - number: equals / >, <, between
  - date: range
  - select: in
  - boolean: is true / false

**Acceptance**:
- [ ] Search "macbook" return relevant matches sorted by similarity
- [ ] Combined filter (category=Laptop, status=active, value>10jt) accurate
- [ ] Custom field filter "chip=M3" return MacBook M3 saja
- [ ] Performance: 1000 asset filter <300ms
- [ ] Mobile filter drawer ergonomic

---

### Group 4.5 — Saved Filter View (Day 10) *(P2 optional)*

- [ ] Defer kalau time tight. V2 candidate.
- [ ] Kalau done: tRPC `views.create/list/delete` (per user per workspace)
- [ ] UI: save current filter sebagai view dengan nama
- [ ] Quick switch dropdown

---

## DoD Phase 4

- [ ] Attachment upload+download stable
- [ ] Image preview works
- [ ] Tag system end-to-end
- [ ] Activity log filterable + paginated
- [ ] Search relevant + fast
- [ ] Filter combinable + accurate
- [ ] All P0 stories pass
- [ ] No memory leak di upload retry
- [ ] CI green

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
| R2 CORS blocking direct upload | Set CORS origin list awal di R2 settings |
| Upload retry mengabaikan partial state | Cleanup orphan attachment via weekly cron |
| Trigram index slow di Postgres 16 | Test dengan 10k row dataset, alternatif: pg_trgm + GIN |
| Custom field filter UX kompleks | Limit MVP ke 1 field at a time, advanced V2 |
| Large file upload time-out Vercel | Direct-to-R2 (signed URL bypass server), Vercel 30s function limit |
| Activity log table growth | Partition by month V2 kalau >1M rows |

---

## Changelog

- 0.1 — Initial Phase 4 checklist. 10-day plan, 18 stories.
