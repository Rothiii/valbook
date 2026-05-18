# Permission Matrix

# Collaborative Asset Workspace Platform

Version: 0.2
Source: [erd.md](erd.md) + [api-design.md](api-design.md) + [mvp-stories.md](mvp-stories.md)

---

## 1. Roles

| Role | Description | How assigned |
|---|---|---|
| **Owner** | Full control workspace. Hanya 1 per workspace (MVP). | Creator default. Transfer via dedicated flow. |
| **Editor** | Can manage all data (asset, category, owner, tag, valuation, attachment). | Invited by owner. |
| **Viewer** | Read-only access. | Invited by owner. |
| **Anonymous** | Unauthenticated visitor via public share token. | Holds valid token. |

**Decisions**:
- MVP: **single owner per workspace**. Multi-owner = V2.
- No system-level admin di MVP (no superadmin).
- Roles are workspace-scoped, not global.

---

## 2. Role Hierarchy

```
Owner > Editor > Viewer > Anonymous
```

Higher role inherits read permissions of lower roles. Mutations gated explicitly per resource.

---

## 3. Resource × Action Matrix

Legend:
- ✅ Allowed
- ❌ Denied
- ⚠️ Self-only or conditional (see notes)

### 3.1 Workspace

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| View workspace metadata | ✅ | ✅ | ✅ | ⚠️ (via share) |
| Update name / settings | ✅ | ❌ | ❌ | ❌ |
| Update display currency | ✅ | ❌ | ❌ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |
| Create workspace | n/a (any authenticated user) | | | |

### 3.2 Membership

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| View member list | ✅ | ✅ | ✅ | ❌ |
| Invite member | ✅ | ❌ | ❌ | ❌ |
| Resend invitation | ✅ | ❌ | ❌ | ❌ |
| Revoke pending invitation | ✅ | ❌ | ❌ | ❌ |
| Change member role | ✅ | ❌ | ❌ | ❌ |
| Remove member (other) | ✅ | ❌ | ❌ | ❌ |
| Leave workspace (self) | ⚠️ blocked until transfer | ✅ | ✅ | ❌ |
| Accept invitation | any authenticated user holding token | | | |

**Notes**:
- Owner cannot remove self via "remove member". Must transfer first.
- Cannot demote self below owner.
- Cannot escalate own role.

### 3.3 Categories & Fields

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| List categories | ✅ | ✅ | ✅ | ⚠️ (via share, visible names only) |
| Get category + fields schema | ✅ | ✅ | ✅ | ❌ |
| Create category | ✅ | ✅ | ❌ | ❌ |
| Update category (name/icon/color) | ✅ | ✅ | ❌ | ❌ |
| Delete category | ✅ | ✅ | ❌ | ❌ |
| Add field | ✅ | ✅ | ❌ | ❌ |
| Update field (label/required) | ✅ | ✅ | ❌ | ❌ |
| Reorder fields | ✅ | ✅ | ❌ | ❌ |
| Delete field | ✅ | ✅ | ❌ | ❌ |

### 3.4 Owner Labels & Tags

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| List | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |

### 3.5 Assets

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| List assets | ✅ | ✅ | ✅ | ⚠️ (via share, scope-limited) |
| View asset detail | ✅ | ✅ | ✅ | ⚠️ (via share, scope-limited) |
| Create asset | ✅ | ✅ | ❌ | ❌ |
| Update asset | ✅ | ✅ | ❌ | ❌ |
| Archive asset | ✅ | ✅ | ❌ | ❌ |
| Unarchive asset | ✅ | ✅ | ❌ | ❌ |
| Set parent (hierarchy) | ✅ | ✅ | ❌ | ❌ |
| Assign tags | ✅ | ✅ | ❌ | ❌ |
| Hard delete asset | ✅ | ❌ | ❌ | ❌ |

### 3.6 Valuation

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| View history + chart | ✅ | ✅ | ✅ | ⚠️ (via share, latest value only) |
| Create entry | ✅ | ✅ | ❌ | ❌ |
| Update entry | ✅ | ✅ | ❌ | ❌ |
| Delete entry | ✅ | ✅ | ❌ | ❌ |
| Bulk CSV import | ✅ | ✅ | ❌ | ❌ |

### 3.7 Attachments

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| List attachments | ✅ | ✅ | ✅ | ❌ (hidden from public) |
| Download (signed URL) | ✅ | ✅ | ✅ | ❌ |
| Request upload URL | ✅ | ✅ | ❌ | ❌ |
| Confirm upload | ✅ | ✅ | ❌ | ❌ |
| Delete attachment | ✅ | ✅ | ❌ | ❌ |

**Decision**: attachments tidak exposed di public share MVP. V2 bisa opsi per-link toggle.

### 3.8 Activity Logs

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| List workspace activity | ✅ | ✅ | ✅ | ❌ |
| List asset activity | ✅ | ✅ | ✅ | ❌ |
| Delete log entry | ❌ | ❌ | ❌ | ❌ |

**Decision**: activity log immutable. No delete API.

### 3.9 Public Sharing

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| List active shares | ✅ | ❌ | ❌ | ❌ |
| Create public link (workspace) | ✅ | ❌ | ❌ | ❌ |
| Create public link (asset) | ✅ | ❌ | ❌ | ❌ |
| Update expiry | ✅ | ❌ | ❌ | ❌ |
| Revoke link | ✅ | ❌ | ❌ | ❌ |

**Decision**: hanya owner yang bisa generate / revoke share link. Editor tidak boleh karena risiko data leak.

### 3.10 Currency

| Action | Owner | Editor | Viewer | Anonymous |
|---|:---:|:---:|:---:|:---:|
| List supported currencies | ✅ | ✅ | ✅ | ✅ |
| View rates | ✅ | ✅ | ✅ | ❌ |
| Manual rate override (workspace) | ✅ | ❌ | ❌ | ❌ |

---

## 4. Anonymous (Public Share) Access Rules

### 4.1 Scope

Token mengandung `scope`:
- `workspace` → akses semua aset non-archived di workspace.
- `asset` → akses 1 asset spesifik (+ sub-asset tree-nya kalau diaktifkan).

### 4.2 Visible to anonymous

- ✅ Workspace name, display currency, total value, asset count *(only for scope=workspace)*
- ✅ Asset name, code, status, location, current value, current currency
- ✅ Custom field values (semua field di category)
- ✅ Latest valuation value
- ✅ Category name, owner label name, tag name (display only)
- ✅ Asset hierarchy parent-child relationship — **only for scope=workspace**. Untuk scope=asset, parent + ancestor tidak ditampilkan (standalone view).
- ✅ Sub-asset list (children) — both scopes, tapi hanya direct children + values, tidak ada link aktif keluar scope.

### 4.3 Hidden from anonymous

- ❌ Member list, member emails
- ❌ Activity log
- ❌ Sharing config / other share links
- ❌ Workspace settings
- ❌ Internal IDs (return slug/short code instead)
- ❌ Created_by / actor names
- ❌ Attachment files
- ❌ Valuation history detail (only latest value)
- ❌ Notes field (configurable per share? V2)
- ❌ Purchase price (configurable per share? V2)
- ❌ Parent asset & ancestor chain — only when scope=asset (privacy: jangan bocorin struktur workspace)
- ❌ Workspace metadata (total value, count) — only when scope=asset

### 4.4 Public access lifecycle

- Token validates: `revoked_at IS NULL` AND (`expires_at IS NULL` OR `expires_at > now()`).
- On revoke: invalidate edge cache.
- Rate limit: 100 req/min/IP.
- No write actions allowed.

---

## 5. Permission Enforcement Layers

### 5.1 Layer 1 — tRPC middleware

`workspaceProcedure(slug)`:
```ts
1. require session
2. find workspace by slug
3. find membership { workspace_id, user_id }
4. if no membership → FORBIDDEN
5. inject { workspace, member, role } to context
```

`editorProcedure`:
```ts
extend workspaceProcedure
if role not in ['owner', 'editor'] → FORBIDDEN
```

`ownerProcedure`:
```ts
extend workspaceProcedure
if role !== 'owner' → FORBIDDEN
```

### 5.2 Layer 2 — Resource ownership check

Untuk endpoint yang accept entity ID (asset, valuation, attachment, etc.):
```ts
1. fetch entity
2. verify entity.workspace_id === ctx.workspace.id
3. if mismatch → NOT_FOUND (don't leak existence)
```

### 5.3 Layer 3 — Database constraint

- All entity rows tied to `workspace_id` (CASCADE).
- Row-level security (RLS) opsional — skip MVP, rely pada app layer. Reconsider V2 kalau multi-tenant query risk.

---

## 6. Special Cases

### 6.1 Owner self-leave block

Owner tidak bisa `leave` workspace. Must:
1. Transfer ownership to another member (must be active member, accept verification).
2. Then leave as regular member.

### 6.2 Workspace deletion safeguard

- Confirm modal: ketik nama workspace persis.
- CASCADE semua child rows.
- Hapus juga object storage (asynchronous job).
- Audit log entry sebelum delete (sebagai forensic trail).

### 6.3 Last member leaves

- Tidak bisa terjadi karena owner harus stay sampai transfer.
- Kalau workspace orphan (e.g., owner account deleted) → status `pending_transfer`, all members frozen sampai admin intervene (manual ops).

### 6.4 Email verification gate

User unverified:
- ✅ Can login
- ✅ Can view own profile
- ❌ Cannot create workspace
- ❌ Cannot accept invitation
- ❌ Cannot invite others

### 6.5 Concurrent permission change

Editor sedang edit asset, owner downgrade jadi viewer di tab lain:
- Server reject mutation dengan 403 FORBIDDEN.
- Client tampilkan "your role has changed, please refresh".

---

## 7. Audit Log Coverage

Semua action ini wajib tulis ke `activity_logs`:

| Action | entity_type | action |
|---|---|---|
| Asset create/update/archive/delete | `asset` | `create`/`update`/`archive`/`delete` |
| Asset reparent | `asset` | `reparent` |
| Valuation create/update/delete | `valuation` | `create`/`update`/`delete` |
| Valuation bulk import | `valuation` | `bulk_import` |
| Category create/update/delete | `category` | `create`/`update`/`delete` |
| Field create/update/delete | `field` | `create`/`update`/`delete` |
| Owner label CRUD | `owner_label` | ... |
| Tag CRUD | `tag` | ... |
| Member invite/accept/role change/remove/leave | `member` | `invite`/`accept`/`role_change`/`remove`/`leave` |
| Attachment upload/delete | `attachment` | `upload`/`delete` |
| Sharing create/revoke | `share` | `create`/`revoke` |
| Workspace update/delete/transfer | `workspace` | `update`/`delete`/`transfer` |

**Diff field**: jsonb `{ before: {...}, after: {...} }` untuk update; `{ snapshot: {...} }` untuk create; `null` untuk delete/leave.

---

## 8. Future Considerations (V2+)

- **Multi-owner**: butuh ownership transfer model berubah, ownership log.
- **Custom roles**: per-workspace role definition (e.g., "Accountant" = read all + write valuation only).
- **Per-asset permission**: user X can edit asset Y only.
- **Approval workflow**: Editor change → Owner approve.
- **Row-level security (Postgres RLS)**: defense in depth.
- **API key / service account**: third-party integration.
- **Read-only API token**: programmatic read access tanpa user session.
- **Public share with edit**: link with limited write (e.g., add valuation only).

---

## 9. Implementation Checklist (Phase 0/1)

- [ ] Middleware: `protectedProcedure`, `workspaceProcedure`, `editorProcedure`, `ownerProcedure`
- [ ] Helper: `assertEntityInWorkspace(entity, workspaceId)`
- [ ] Test suite: per-role per-action positive + negative
- [ ] Audit log writer abstraction (transactional with mutation)
- [ ] Email verification gate middleware
- [ ] Public share token validator + rate limiter
- [ ] Owner-leave block logic
- [ ] Concurrent role change error handling client-side

---

## 10. Test Cases (Per Role)

### Owner can / cannot
- ✅ Create asset, invite member, generate share, delete workspace
- ❌ Self-leave without transfer
- ❌ Demote self

### Editor can / cannot
- ✅ Create/update/archive asset, manage category/field/tag/owner_label, valuation, attachment
- ❌ Invite member, manage sharing, hard delete asset, delete workspace, transfer ownership
- ✅ Leave workspace

### Viewer can / cannot
- ✅ View all data including activity log
- ❌ Any mutation
- ✅ Leave workspace

### Anonymous can / cannot
- ✅ View public-scoped data only
- ❌ Any write, any access to hidden fields, any invite/sharing config

---

## 11. Changelog

- 0.2 — Cross-doc fix #4: clarify public share asset scope = standalone (no parent breadcrumb, no workspace meta). Sub-asset children tetap visible.
- 0.1 — Initial matrix. 4 roles, 10 resource groups, anonymous rules, audit log mapping, enforcement layers.
