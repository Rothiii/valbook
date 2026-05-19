# Phase 1 — MVP Core Checklist

# Collaborative Asset Workspace Platform

Version: 0.2
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md), [permission-matrix.md](permission-matrix.md)
Window: **Week 3–7** (25 working days, +1 minggu vs original karena mobile-equal)

---

## Status: 🟡 Slicing complete (in-memory)

Phase 1 dijalankan dengan **slicing-first workflow** (lihat memory feedback-slicing-first):
1. ✅ Semua UI feature flows dibangun pakai `zustand` + `persist` (localStorage)
2. ✅ Backend per-feature folders (db, service, router) di-scaffold sebagai stub `TODO(phase-1)`
3. ⏳ Wiring real tRPC + Drizzle: deferred sampai semua phase sliced

Setiap group di bawah ditandai berdasar slicing status, bukan backend wiring.

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

### Group 1.1 — Auth Completion ✅

- [x] Logout button (account page + reusable component)
- [x] In-memory auth store (`features/auth/store.ts`) with users, session
- [x] LoginForm wired ke zustand store
- [x] RegisterForm dengan verification token returned + auto-route
- [x] ForgotPasswordForm + ResetPasswordForm (in-memory token map)
- [x] VerifyEmailAction component
- [x] ProfileForm update name
- [ ] OAuth Google → V2 (deferred)
- [ ] Email verification gate middleware → wiring saat better-auth dipake real

**Acceptance**:
- [x] User logout → session cleared → redirect login
- [x] Forgot password → token returned → reset form → password updated → re-login
- [x] Unverified user block login dengan error "verify email first"

---

### Group 1.2 — Workspace List + Switcher ✅

- [x] `/app` page: WorkspaceList component dengan empty state
- [x] WorkspaceCard: name, member count, display currency
- [x] Last-active workspace tracked via `currentSlug` di store
- [x] WorkspaceSwitcherLive di topbar (workspace context)
- [x] Empty state → /onboarding
- [ ] tRPC `workspaces.list` + `workspaces.get` → wiring deferred (stub di server/)

**Acceptance**:
- [x] User dengan 0 workspace → list empty + CTA to onboarding
- [x] User dengan 1+ workspace → list dengan card, click → masuk workspace
- [x] Switcher dropdown menampilkan list workspace + "+ Create workspace"
- [ ] Mobile: switcher bottom-sheet → Phase 6 polish

---

### Group 1.3 — Workspace Settings ✅

- [x] `/app/w/[slug]/settings` page wired
- [x] Edit nama + slug
- [x] Display currency selector
- [ ] Locale + timezone setting → defer Phase 6 polish
- [x] Delete workspace confirm modal (ketik nama)
- [ ] Transfer ownership flow → Phase 2 (multi-member)
- [ ] tRPC `workspaces.update/delete/transferOwnership` → wiring deferred

**Acceptance**:
- [x] Owner dapat edit name, slug, displayCurrency
- [x] Delete dengan confirmation match nama berhasil
- [x] Activity log entry untuk update + delete
- [ ] Editor/Viewer 403 enforcement → wiring saat tRPC dipake real
- [ ] Transfer ownership → Phase 2

---

### Group 1.4 — Activity Log Writer ✅

- [x] Helper hook `useWriteActivity()` + cross-store `useActivityStore.getState().writeActivity(...)`
- [x] Called from workspace, category, owner-label, asset stores
- [x] Diff field populated (before/after for update, snapshot for create)
- [ ] Transactional dengan main mutation → wiring saat real DB
- [ ] Unit test happy + failure case → Phase 1 integration test

**Acceptance**:
- [x] Workspace mutations (create/update/delete) tulis activity log
- [x] Diff field populated
- [x] ActivityFeed render log dengan actor + entity + relative time

---

### Group 1.5 — Asset CRUD Basic ✅

**Frontend (in-memory):**

- [x] Asset zustand store dengan CRUD actions
- [x] `useAssets` hook dengan filter (search, status, includeArchived, category, owner)
- [x] `useAsset` hook untuk single
- [x] `useAssetChildren` untuk hierarchy
- [x] Cycle detection di setParent (prevent loop)
- [x] AssetForm dengan react-hook-form + zod
- [x] AssetTable dengan search + include-archived toggle
- [x] AssetDetail dengan 5 tabs (Overview, Valuation, Attachments, Activity, Sub-assets)
- [x] Archive/Unarchive/Delete buttons
- [x] Activity log entry per mutation
- [x] Wired: `/app/w/[slug]/assets`, `/assets/new`, `/assets/[id]`

**Backend (stub):**

- [ ] `features/asset/server/{db,service,router}.ts` → TODO comments
- [ ] tRPC assets.* + Drizzle schema → wiring deferred

**Acceptance:**
- [x] Editor dapat create/update/archive/unarchive/delete asset
- [x] List filter combine search + status + archived
- [x] Activity log entry untuk setiap mutasi (verifiable in UI)
- [x] Detail page render category, owner, location, notes
- [x] Sub-asset count + list in detail
- [ ] Permission enforcement (Phase 2 multi-member)
- [ ] Asset code uniqueness → Phase wiring
- [ ] Cursor pagination → Phase wiring (list pakai client filter now)
- [ ] Mobile card view → Phase 6 polish

---

### Group 1.6 — Static Category CRUD ✅

- [x] Category zustand store dengan CRUD + seed (untuk template materialize)
- [x] `useCategories`, `useCategory`, `useCategoryActions` hooks
- [x] CategoryForm dengan icon + color
- [x] CategoryList dengan delete confirm (browser confirm)
- [x] Auto-seed dari template saat workspace dibuat
- [x] Activity log entry
- [x] Wired: `/app/w/[slug]/categories`

**Note**: dynamic field defer Phase 2.

**Acceptance**:
- [x] Editor dapat CRUD category
- [x] Template create workspace auto-seed categories
- [ ] Delete dengan asset existing → reassign modal → Phase 2 polish (current: simple confirm)

---

### Group 1.7 — Owner Label CRUD ✅

- [x] OwnerLabel zustand store dengan CRUD
- [x] `useOwnerLabels`, `useOwnerLabel`, `useOwnerLabelActions` hooks
- [x] OwnerLabelList dengan create dialog + delete
- [x] Activity log entry
- [x] Wired: `/app/w/[slug]/owners`
- [x] Asset form pakai owner label dropdown

**Acceptance**:
- [x] Owner label assignable di asset create/edit form
- [x] Color hex preview di list

---

### Group 1.8 — Dashboard ✅

- [x] `/app/w/[slug]` dashboard dengan real data
- [x] Stat cards: total value (per currency), active count, archived count
- [x] By category distribution (count per category)
- [x] By owner distribution (count per owner)
- [x] Recent activity feed (last 10)
- [x] Add asset quick action
- [ ] Growth chart → Phase 3 (placeholder)
- [ ] Total value converted ke display currency → Phase 3 (currently grouped per currency)

**Acceptance**:
- [x] Workspace baru → empty stats + 0 counts
- [x] Workspace dengan asset → stats populate
- [x] Activity feed render mutation entries
- [ ] Mobile responsif → Phase 6 polish

---

### Group 1.9 — Workspace Member List (Read-only) ✅

- [x] `/app/w/[slug]/members` list page
- [x] Show member dari `useWorkspaceMembers(workspace.id)`
- [x] Owner default (current user saat workspace dibuat)
- [x] Role badge
- [x] Joined date
- [ ] Invite UI → Phase 2

**Acceptance**:
- [x] Owner workspace tampil sebagai member dengan role `owner`

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

- 0.2 — Slicing pass complete. All 9 groups marked done at in-memory level (zustand store + persist). Backend per-feature folders contain stub TODO files. Wiring real Drizzle + tRPC deferred until all phases sliced (slicing-first workflow).
- 0.1 — Initial Phase 1 checklist. 25-day plan, 17 stories.
