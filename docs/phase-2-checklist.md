# Phase 2 — Dynamic + Collaboration Checklist

# Collaborative Asset Workspace Platform

Version: 0.1
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md), [permission-matrix.md](permission-matrix.md)
Window: **Week 8–12** (25 working days)

---

## Overview

Phase 2 = product differentiator. Output: workspace dapat customize field per kategori + multi-user collaboration + asset hierarchy. **No valuation history, no advanced features**.

**Acceptance gate ke Phase 3**: tim dapat collaborate manage asset dengan dynamic schema sesuai kebutuhan domain.

---

## Stories covered

| Epic | Story IDs |
|---|---|
| Dynamic Category Fields | CAT-05, CAT-06, CAT-07 *(P1)*, CAT-08 |
| Asset dynamic form | AST-08, AST-09 |
| Membership | MEM-01..MEM-07 |
| Owner label completion | (kalau belum dari Phase 1) |
| Asset Hierarchy | HIER-01..HIER-04 |

Total: 17 stories (14 P0, 3 P1).

---

## Step Groups

### Group 2.1 — Category Fields Schema (Day 1–3)

**Day 1: Backend**

- [ ] tRPC `fields.list` / `get` per category
- [ ] tRPC `fields.create` dengan validation (key slug auto, type valid, options jsonb untuk select)
- [ ] tRPC `fields.update` (label, required, options — key immutable)
- [ ] tRPC `fields.delete` dengan check existing asset data → block kalau ada
- [ ] tRPC `fields.reorder` (array of IDs → update sort_order)
- [ ] Activity log entry

**Day 2: Frontend setting**

- [ ] Category detail page tambahan: tab "Fields"
- [ ] Field list dengan drag handle (dnd-kit)
- [ ] Add field modal: pick type → input label → auto-slug key → required toggle → options (kalau select)
- [ ] Edit field modal (label + required + options only)
- [ ] Delete field confirm dengan data-exists check

**Day 3: Polish**

- [ ] Field type icons (text, number, date, select, boolean, url, currency)
- [ ] Drag reorder UX
- [ ] Mobile touch drag bekerja

**Acceptance**:
- [ ] Editor dapat CRUD field per category
- [ ] Key auto-slug + editable sebelum first save
- [ ] Block delete kalau ada asset dengan data di field tsb
- [ ] Reorder persist setelah refresh
- [ ] Activity log entry

---

### Group 2.2 — Dynamic Asset Form (Day 4–7)

**Day 4: Validation engine**

- [ ] Helper `buildDynamicSchema(fields)` → return zod schema runtime
- [ ] Validate `customFields` di server insert/update
- [ ] Server: fetch fields by category_id sebelum validate
- [ ] Type-specific validator (number, date, select option valid)

**Day 5–6: Form render**

- [ ] Asset form: pick category → fetch fields → render dynamic input section
- [ ] Field render per type (Input, NumberInput, DatePicker, Select, MultiSelect, Switch, URL, Currency)
- [ ] Required field marker
- [ ] Validation error inline per field
- [ ] Edit asset → existing custom_fields populate

**Day 7: Edge cases**

- [ ] Change category di edit form → confirm dialog (existing custom_fields lost atau preserve?)
- [ ] Decision: preserve as legacy, show warning "X fields tidak match category baru"
- [ ] Detail page render custom fields sesuai schema
- [ ] Sort field display sesuai sort_order

**Acceptance**:
- [ ] Editor pilih category Laptop → form muncul Chip, RAM, Storage, Serial
- [ ] Required field block submit
- [ ] Detail asset tampilkan custom field values terformat per type
- [ ] Custom field validation reject invalid type (e.g. string ke number field)
- [ ] Change category preserve old data dengan banner warning

---

### Group 2.3 — Member Invitation Flow (Day 8–12)

**Day 8: Backend invite**

- [ ] tRPC `members.invite` (email + role) → insert invitation + send email via Resend
- [ ] Email template `invitation.tsx` (workspace name, inviter name, accept link, expiry)
- [ ] Generate token crypto-random (32 byte)
- [ ] Block invite kalau email sudah jadi member atau invitation pending
- [ ] tRPC `members.resendInvitation` + `members.revokeInvitation`

**Day 9: Backend accept**

- [ ] tRPC `members.acceptInvitation({ token })` → validate, check expired, check user email match
- [ ] Insert `workspace_members` row + mark `accepted_at` di invitation (transaction)
- [ ] Block expired token, return clear error
- [ ] Activity log

**Day 10: Frontend invite modal**

- [ ] Members page tambah invite button (owner only)
- [ ] Invite modal: email + role + optional message
- [ ] Pending invitation section di members list (resend / revoke)
- [ ] Toast feedback

**Day 11: Frontend accept page**

- [ ] `/invite/:token` public route (auth required)
- [ ] If not logged in → redirect login dengan return URL
- [ ] If logged in dengan email match → confirm join screen
- [ ] If email mismatch → error "use the email this invitation was sent to"
- [ ] Accept → redirect workspace dashboard

**Day 12: Role management**

- [ ] tRPC `members.updateRole` (owner only)
- [ ] tRPC `members.remove` (owner only)
- [ ] tRPC `members.leave` (block owner)
- [ ] Members list: change role dropdown, remove button, leave button
- [ ] Owner can't downgrade self
- [ ] Activity log untuk role change, remove, leave

**Acceptance**:
- [ ] Owner invite email → invitee terima email → click → register/login → confirm → join
- [ ] Invitation expired (>7 days) tampil error tidak crash
- [ ] Owner change member role → effect immediate (test concurrent session)
- [ ] Owner remove member → member kehilangan akses workspace
- [ ] Non-owner attempt invite → 403
- [ ] Editor invite member → 403 (per permission matrix)
- [ ] Email match strict (invitation untuk a@x.com tidak bisa accept by b@y.com)

---

### Group 2.4 — Asset Hierarchy (Day 13–16)

**Day 13: Backend**

- [ ] tRPC `assets.setParent({ id, parentId | null })`
- [ ] Validate: parent same workspace, no circular reference
- [ ] Helper `wouldCreateCycle(assetId, newParentId)` recursive check
- [ ] tRPC `assets.tree({ rootId? })` return nested children
- [ ] Update `assets.list` filter optional `parentAssetId`
- [ ] Activity log `asset.reparent`

**Day 14: Parent picker UI**

- [ ] Modal: search asset di workspace
- [ ] Exclude self + descendants from picker
- [ ] Hierarchy preview di picker (breadcrumb path)
- [ ] Set / Remove parent action di asset detail

**Day 15: Tree view**

- [ ] Asset list opsi "Tree view" (expandable rows)
- [ ] Detail page: breadcrumb parent → ancestor (clickable)
- [ ] Detail page: sub-assets section (direct children list dengan + Add child)
- [ ] Max depth 5 level (warning kalau coba lebih)

**Day 16: Edge cases**

- [ ] Archive parent → children tetap visible (jangan auto-archive)
- [ ] Delete parent (hard) → children SET NULL (root)
- [ ] Move parent ke deep level → recompute breadcrumb
- [ ] Pindah child antar workspace → block (must same workspace)

**Acceptance**:
- [ ] Editor set parent untuk asset → muncul di sub-assets parent
- [ ] Circular ref block (A parent B, set B parent A → error)
- [ ] Breadcrumb tampil di detail dengan link aktif
- [ ] Tree view ekspand/collapse smooth
- [ ] Mobile tree view friendly

---

### Group 2.5 — Member-Aware UI Polish (Day 17–18)

- [ ] Show user avatar inisial di topbar
- [ ] Asset detail show created_by (avatar + name)
- [ ] Activity log preview di detail show actor name
- [ ] Member online indicator (defer V2 — realtime)
- [ ] "Member X invited you" notification (banner sekali pada login pertama setelah accept — basic, no full notif system)

---

### Group 2.6 — Permission Hardening (Day 19–20)

- [ ] Audit semua tRPC procedure pakai middleware benar
- [ ] Add integration test per role per action (matrix)
- [ ] Concurrent role change scenario test
- [ ] Email verification gate untuk accept invitation (unverified user reject)
- [ ] Rate limit: invite 50/hour/workspace enforced

---

### Group 2.7 — Phase 2 Integration Test (Day 21–22)

- [ ] E2E: owner invite member → member accept → member create asset → owner update role to viewer → member can't edit
- [ ] E2E: dynamic field create → asset create dengan dynamic data → edit → detail view
- [ ] E2E: asset hierarchy 3 level → reparent → breadcrumb update
- [ ] Performance: tree workspace 1000 asset load <1.5s

---

### Group 2.8 — Buffer + Demo (Day 23–25)

- [ ] Buffer untuk slip
- [ ] Demo recording untuk stakeholder
- [ ] Phase 2 retro
- [ ] Phase 3 prep

---

## DoD Phase 2

- [ ] All P0 stories pass acceptance
- [ ] Multi-user collaboration end-to-end working
- [ ] Dynamic schema validation robust
- [ ] Hierarchy depth 5 supported tanpa perf degradation
- [ ] Email invitation reliable (test domain reputation Resend)
- [ ] Permission test 100% coverage
- [ ] Mobile + desktop polished
- [ ] CI green

---

## Out of Scope Phase 2

- Valuation history (Phase 3)
- Attachment (Phase 4)
- Tags (Phase 4)
- Dashboard charts (Phase 3)
- Public sharing (Phase 5)
- Notification system (V2)
- Realtime presence (V2)

---

## Risks

| Risk | Mitigation |
|---|---|
| Dynamic schema validation kompleks | Pakai zod runtime build, test edge case awal |
| Field rename / delete data loss | Strict block delete, label-only edit |
| Hierarchy circular ref bug | Recursive check + DB constraint via trigger backup |
| Email deliverability | Setup DKIM, SPF, DMARC, monitor bounce rate Resend |
| Member email mismatch confusion | Clear error UI + docs |
| Race condition role change | Optimistic + retry pada client, server final say |

---

## Changelog

- 0.1 — Initial Phase 2 checklist. 25-day plan, 17 stories.
