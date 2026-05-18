# Phase 1 — MVP Core Checklist

# Collaborative Asset Workspace Platform

Version: 0.1
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md), [permission-matrix.md](permission-matrix.md)
Window: **Week 3–7** (25 working days, +1 minggu vs original karena mobile-equal)

---

## Overview

Phase 1 = first usable slice. Output: authenticated user dapat full CRUD asset di workspace dengan kategori statis. **No dynamic field, no collaboration, no valuation history, no sharing**.

**Acceptance gate ke Phase 2**: user solo dapat manage portfolio asset miliknya sendiri di multiple workspace.

---

## Stories covered

| Epic | Story IDs |
|---|---|
| Authentication | AUTH-03, AUTH-04 *(P0 wrap-up)*, AUTH-05 *(P1)*, AUTH-06 *(P2 optional)* |
| Workspace | WS-03, WS-04, WS-05, WS-06 *(P1)* |
| Asset basic | AST-01, AST-02, AST-03, AST-04, AST-05, AST-06 *(P1)*, AST-07 *(P2)* |
| Category static | CAT-01, CAT-02, CAT-03, CAT-04 |
| Owner label | OWN-01..04 *(needed for asset assign)* |

Total: 17 stories (12 P0, 4 P1, 1 P2).

---

## Step Groups

### Group 1.1 — Auth Completion (Day 1)

- [ ] Logout UI di app shell (dropdown user menu)
- [ ] `auth.signOut` integration
- [ ] Password reset request page + form
- [ ] Reset confirm page (`/reset-password/:token`)
- [ ] Email template `password-reset.tsx` polish
- [ ] Resend verification email button
- [ ] Email verification gate middleware (block unverified user pakai mutation)
- [ ] OAuth Google (optional, push V2 kalau time tight)

**Acceptance**:
- [ ] User logout → session destroyed → redirect login
- [ ] Forgot password → email link → reset → login dengan password baru
- [ ] Unverified user dapat login tapi block create workspace dengan banner CTA

---

### Group 1.2 — Workspace List + Switcher (Day 2)

- [ ] `/app` page: list workspace user
- [ ] Workspace card: name, total asset count, member count
- [ ] Last-active workspace remember (localStorage)
- [ ] Workspace switcher dropdown di topbar (search, last accessed, all)
- [ ] Empty state: "create your first workspace" → onboarding template picker
- [ ] tRPC: `workspaces.list` + `workspaces.get`

**Acceptance**:
- [ ] User dengan 0 workspace → redirect ke onboarding
- [ ] User dengan 1+ workspace → tampil list, click → masuk workspace
- [ ] Switcher search filter bekerja
- [ ] Mobile: switcher bottom-sheet drawer

---

### Group 1.3 — Workspace Settings (Day 3)

- [ ] `/app/w/:slug/settings` page
- [ ] Edit nama + slug (slug validasi unique)
- [ ] Display currency selector
- [ ] Locale + timezone setting
- [ ] Delete workspace confirm modal (ketik nama)
- [ ] Transfer ownership flow (pick member, confirm, transfer)
- [ ] tRPC: `workspaces.update`, `workspaces.delete`, `workspaces.transferOwnership`

**Acceptance**:
- [ ] Owner dapat edit semua field
- [ ] Editor/Viewer 403 di endpoint update
- [ ] Delete cascade berhasil (verify via DB inspect)
- [ ] Transfer ownership update `owner_id` + activity log entry

---

### Group 1.4 — Activity Log Writer (Day 4)

Infrastructure prep untuk semua mutasi nantinya. Wajib done sebelum Group 1.5.

- [ ] Helper function `writeActivity({ workspaceId, actorId, entityType, entityId, action, diff })`
- [ ] Auto-inject di mutation procedure (middleware atau explicit call)
- [ ] Diff calculation utility (`before` vs `after`)
- [ ] Transactional dengan main mutation
- [ ] Unit test happy + failure case

**Acceptance**:
- [ ] All workspace mutations (create/update/delete/transfer) tulis activity row
- [ ] Diff field populated benar (snapshot vs before/after)
- [ ] Rollback activity kalau main mutation gagal

---

### Group 1.5 — Asset CRUD Basic (Day 5–10)

**Day 5–6: Backend**

- [ ] `assets` Drizzle schema verify
- [ ] tRPC `assets.create` (static fields only, no custom_fields validation)
- [ ] tRPC `assets.update`
- [ ] tRPC `assets.archive` / `assets.unarchive`
- [ ] tRPC `assets.get` (with category + owner_label join)
- [ ] tRPC `assets.list` dengan cursor pagination + basic filter (categoryId, status, search)
- [ ] tRPC `assets.delete` (hard, owner only)
- [ ] Activity log integration untuk all asset mutations
- [ ] Permission test: editor/viewer/owner per action

**Day 7–8: Frontend list**

- [ ] `/app/w/:slug/assets` list page
- [ ] Table view (desktop) + card list (mobile)
- [ ] Columns: name, code, category, owner, status, current value
- [ ] Cursor pagination infinite scroll
- [ ] Filter bar: category, status, search (name + code)
- [ ] Bulk archive action (multi-select)
- [ ] Empty state CTA

**Day 9: Asset form**

- [ ] `/app/w/:slug/assets/new` (or modal)
- [ ] Form: name, code, category, owner_label, status, location, notes, purchase_price + currency + date, current_value + currency
- [ ] Currency selector dengan list dari `currencies` table
- [ ] React Hook Form + zod validation
- [ ] Mobile + desktop layout
- [ ] Save → redirect detail
- [ ] Edit form pakai komponen sama (reuse)

**Day 10: Asset detail**

- [ ] `/app/w/:slug/assets/:id` detail page
- [ ] Header: name, status badge, current value card, purchase card
- [ ] Tabs skeleton: Overview, Valuation (P3), Attachments (P4), Activity (P4), Sub-assets (P2)
- [ ] Overview tab: all static fields + notes
- [ ] Edit + Archive button (action menu)
- [ ] Activity log per asset (preview last 5, link to full P4)

**Acceptance**:
- [ ] Editor dapat full CRUD basic asset
- [ ] Viewer hanya read, semua mutation 403
- [ ] List pagination >100 asset jalan smooth
- [ ] Search by name/code (ILIKE) bekerja
- [ ] Filter by category + status combine OK
- [ ] Activity log entry untuk setiap mutasi
- [ ] Asset code unique constraint enforced (try insert duplicate → 409)
- [ ] Mobile card view + desktop table view both polished

---

### Group 1.6 — Static Category CRUD (Day 11–12)

- [ ] tRPC `categories.list` / `get` / `create` / `update` / `delete`
- [ ] Delete dengan reassign modal (kalau ada asset pakai category ini)
- [ ] `/app/w/:slug/categories` settings page
- [ ] Category list + emoji/icon picker + color picker
- [ ] Activity log

**Note**: dynamic field belum disini. Field CRUD masuk Phase 2.

**Acceptance**:
- [ ] Editor dapat CRUD category
- [ ] Delete dengan asset existing → modal reassign muncul
- [ ] Reassign bulk update jalan dalam transaction

---

### Group 1.7 — Owner Label CRUD (Day 13)

- [ ] tRPC `owners.list` / `create` / `update` / `delete`
- [ ] `/app/w/:slug/owners` settings page
- [ ] Inline add owner label dari asset form (modal)
- [ ] Color picker

**Acceptance**:
- [ ] Owner label assignable di asset create/edit form
- [ ] Delete dengan asset existing → SET NULL di asset

---

### Group 1.8 — Dashboard Skeleton (Day 14–15)

Minimal dashboard, full data viz Phase 3.

- [ ] `/app/w/:slug` empty dashboard layout
- [ ] Stat card: total asset count, archived count
- [ ] Recent assets list (last 10 created)
- [ ] Recent activity preview (last 5)
- [ ] Quick actions: + Add Asset, + Invite Member (modal placeholder Phase 2)
- [ ] No charts yet (Phase 3)

**Acceptance**:
- [ ] Workspace baru → empty dashboard + CTAs
- [ ] Workspace dengan asset → stat card populate
- [ ] Mobile responsif

---

### Group 1.9 — Workspace Member List (Read-only Day 16)

Member management mutation full di Phase 2. Phase 1 hanya read.

- [ ] `/app/w/:slug/members` list page (read-only)
- [ ] Show owner + member list (current dari `workspace_members`)
- [ ] No invite UI yet (Phase 2)
- [ ] tRPC `members.list`

**Acceptance**:
- [ ] Owner workspace tampil sebagai member (sendiri saja MVP)

---

### Group 1.10 — Mobile Polish + Bug Bash (Day 17–20)

Buffer untuk:
- [ ] Mobile audit asset form + list
- [ ] Modal full-screen di mobile
- [ ] Bottom nav switching
- [ ] Touch target ≥44px
- [ ] Loading skeleton semua page
- [ ] Empty state semua list
- [ ] Error toast pattern
- [ ] Test cross-browser (Safari iOS, Chrome Android)
- [ ] Fix accumulated bugs

---

### Group 1.11 — Phase 1 Integration Test (Day 21–22)

- [ ] E2E Playwright: register → workspace → asset CRUD → archive → restore
- [ ] E2E: owner edit + delete workspace
- [ ] E2E: transfer ownership (memerlukan 2 user, mock email)
- [ ] Permission matrix test suite untuk Phase 1 endpoints
- [ ] Performance: list 500 asset load <1s

---

### Group 1.12 — Buffer + Demo (Day 23–25)

- [ ] Buffer untuk slip / surprise
- [ ] Internal demo recording
- [ ] Phase 1 retro doc

---

## DoD Phase 1

- [ ] All P0 stories pass acceptance
- [ ] Permission test 100% green per role
- [ ] Solo user end-to-end working (no collab needed)
- [ ] Asset code uniqueness enforced
- [ ] Mobile + desktop usable
- [ ] Activity log captures all mutation
- [ ] CI green
- [ ] No P0 known bug
- [ ] Phase 2 prep doc reviewed

---

## Out of Scope Phase 1

- Custom field per category (Phase 2)
- Member invitation (Phase 2)
- Asset hierarchy parent-child (Phase 2)
- Valuation history (Phase 3)
- Dashboard charts (Phase 3)
- Attachment upload (Phase 4)
- Tags (Phase 4)
- Activity log filter UI (Phase 4)
- Public sharing (Phase 5)

---

## Risks

| Risk | Mitigation |
|---|---|
| Asset form complex untuk mobile | Sticky save bar, collapse advanced fields |
| Activity log writer drift | Strict middleware enforcement, lint rule kalau possible |
| Reassign on category delete slow | Batch update, optimistic UI |
| Cursor pagination edge case (deleted item) | Verify cursor stale handling |

---

## Changelog

- 0.1 — Initial Phase 1 checklist. 25-day plan, 17 stories.
