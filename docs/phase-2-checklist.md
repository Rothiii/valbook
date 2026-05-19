# Phase 2 — Dynamic + Collaboration Checklist

# Collaborative Asset Workspace Platform

Version: 0.2
Source: [mvp-stories.md](mvp-stories.md), [api-design.md](api-design.md), [permission-matrix.md](permission-matrix.md)
Window: **Week 8–12** (25 working days)

## Status: 🟡 Slicing complete (in-memory)

Phase 2 dijalankan dengan **slicing-first workflow**. Backend wiring deferred.

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

### Group 2.1 — Category Fields Schema ✅

- [x] Category store extended with `createField`, `updateField`, `deleteField`, `reorderFields`
- [x] `useCategoryFields(categoryId)` + `useFieldActions()` hooks
- [x] FieldManager component: list fields, add new field with type/required/options
- [x] Auto-slug key from label, immutable after create
- [x] 8 field types supported (text, number, date, select, multi_select, boolean, url, currency)
- [x] Delete field with confirm
- [x] Wired: Dialog from CategoryRow "Fields" button
- [x] Activity log entry per field mutation
- [ ] Drag reorder UI (dnd-kit) → Phase 6 polish (store action ready)

**Acceptance**:
- [x] Editor dapat CRUD field per category
- [x] Key auto-slug + editable (regex validation)
- [x] Activity log entry tertulis

---

### Group 2.2 — Dynamic Asset Form ✅

- [x] DynamicFields component renders inputs per type (text/url, number/currency, date, select, multi_select, boolean)
- [x] Required field marker `*`
- [x] Validation inline per field (required + type + select option)
- [x] AssetForm: pick category → render dynamic fields section
- [x] Edit asset preserves `customFields` data
- [x] AssetDetail Overview tab renders custom field values formatted per type
- [x] customFieldErrors state surfaced inline + toast on submit

**Acceptance**:
- [x] Pilih category dengan fields → form muncul sesuai schema
- [x] Required field block submit dengan error inline
- [x] Detail tampilkan custom field values
- [x] Type validation (number invalid → error)

---

### Group 2.3 — Member Invitation Flow ✅

- [x] Workspace store: `inviteMember`, `acceptInvitation`, `revokeInvitation`, `resendInvitation`, `updateMemberRole`, `removeMember`, `leaveWorkspace`
- [x] Email match strict (case-insensitive)
- [x] Block duplicate invites + existing members
- [x] Expiry 7 days, token 48-char crypto-random concat UUIDs
- [x] `useMembershipActions` hook (useShallow)
- [x] InviteMemberDialog component (email + role + message + mock token preview)
- [x] Members page lists members + pending invitations
- [x] Role dropdown per member (block owner)
- [x] Remove member + revoke + resend invitation actions
- [x] `/invite/[token]` page wired dengan InvitationAccept component
- [x] Login/Register CTA dengan `next=` param kalau anonymous
- [x] Activity log entries (invite, accept, role_change, remove, leave, revoke)

**Acceptance**:
- [x] Owner invite → token returned → mock link visible in dialog + members page
- [x] Visit `/invite/[token]` while logged-out → CTA login/register
- [x] Email mismatch → block accept dengan error message
- [x] Expired invitation → error
- [x] Owner cannot demote/remove self
- [x] Role change writes activity log

---

### Group 2.4 — Asset Hierarchy ✅

- [x] Asset store `setParent` with cycle detection (Phase 1)
- [x] `useAssetAncestors`, `useAssetCandidateParents` hooks
- [x] AssetForm: parent picker Select with "No parent (root)" option + filtered candidates (excludes self + descendants)
- [x] AssetDetail: breadcrumb showing ancestor chain (clickable)
- [x] AssetDetail Sub-assets tab listing direct children (Phase 1)
- [x] Delete parent: store automatically sets child `parentAssetId = null` (Phase 1)
- [x] Cycle prevention enforced (Phase 1)

**Acceptance**:
- [x] Editor set parent → muncul di sub-assets parent + breadcrumb di detail
- [x] Circular ref attempt throws error
- [x] Breadcrumb clickable navigates to ancestor
- [x] Sub-assets list correct count
- [ ] Tree view at asset list → Phase 6 polish (optional)

---

### Group 2.5 — Member-Aware UI Polish 🟡 partial

- [x] Activity log preview di asset detail tab "Activity" sudah render actor name (Phase 1)
- [ ] Topbar avatar inisial → Phase 6 polish
- [ ] Asset created_by display → Phase 6 polish
- [ ] Realtime presence → V2

---

### Group 2.6 — Permission Hardening ⏳ wiring phase

Slicing-first; rate limit + middleware enforcement = saat tRPC dipake real.

---

### Group 2.7 — Phase 2 Integration Test ⏳ wiring phase

E2E test berlaku setelah DB connected. Slicing-only saat ini tidak butuh.

---

### Group 2.8 — Buffer + Demo ⏳ wiring phase

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

- 0.2 — Slicing pass complete. Groups 2.1–2.4 done at in-memory zustand level. Group 2.5 partial (activity actor name done). Group 2.6–2.8 deferred until wiring phase.

- 0.1 — Initial Phase 2 checklist. 25-day plan, 17 stories.
