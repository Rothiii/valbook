# API Design

# Collaborative Asset Workspace Platform

Version: 0.3
Source: [erd.md](erd.md) + [mvp-stories.md](mvp-stories.md)

---

## 1. Architecture Decision

**Primary**: tRPC v11 untuk semua internal app calls (frontend → backend in monorepo Next.js).
**Secondary**: REST untuk public endpoint (sharing, future webhook, future third-party integration).
**Auth**: better-auth handles `/api/auth/*` (login, register, session, OAuth).

### Why this split

- tRPC: type-safe end-to-end, DX bagus, cocok untuk Next.js monolith.
- REST: stable contract untuk public sharing + future API consumer.
- better-auth: managed, jangan rebuild.

---

## 2. Folder Layout

```
src/server/
  routers/
    workspaces.ts
    members.ts
    categories.ts
    fields.ts
    owners.ts
    tags.ts
    assets.ts
    valuation.ts
    attachments.ts
    activity.ts
    dashboard.ts
    sharing.ts
    currency.ts
  trpc.ts              // context, middleware
  index.ts             // root router

src/app/api/
  auth/[...all]/       // better-auth handler
  public/[token]/      // public REST GET
  attachments/         // signed-URL endpoint
  webhooks/
    cron/rate-refresh/ // internal cron
```

---

## 3. tRPC Context

Setiap request membawa:

```ts
{
  session: {
    user: { id, email, name } | null
  },
  db: DrizzleClient,
  req: Request,
  ip: string,
}
```

Middleware tier:

```ts
publicProcedure          // no auth
protectedProcedure       // require session
workspaceProcedure(slug) // require member of workspace
  └─ injects { workspace, member, role }
ownerProcedure           // require role = owner
editorProcedure          // require role >= editor
```

---

## 4. Error Format

### tRPC

Pakai `TRPCError` standard codes:
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `BAD_REQUEST` (400) — validation
- `CONFLICT` (409) — uniqueness, version mismatch
- `TOO_MANY_REQUESTS` (429)
- `INTERNAL_SERVER_ERROR` (500)

Error shape (custom shaper):

```ts
{
  error: {
    code: "FORBIDDEN",
    message: "Need editor role to update asset",
    details?: { field?: string, ... }
  }
}
```

### REST (public)

```json
{ "error": { "code": "NOT_FOUND", "message": "Share link revoked or expired" } }
```

---

## 5. Validation Strategy

- **Zod** untuk semua input — schema declared di shared file, dipakai client + server.
- Schema file lokasi: `src/lib/schema/{entity}.ts`
- tRPC pakai `.input(zodSchema)`.
- REST endpoint pakai `zodSchema.parse()` di handler.
- Field-level error map ke `details.fieldErrors`.

Contoh:

```ts
// src/lib/schema/asset.ts
export const createAssetSchema = z.object({
  workspaceId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  code: z.string().max(100).optional(),
  ownerLabelId: z.string().uuid().optional(),
  parentAssetId: z.string().uuid().optional(),
  status: z.enum(["active", "archived", "sold", "lost", "disposed"]).default("active"),
  location: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  purchasePrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  purchaseCurrency: z.string().length(3).optional(),
  purchaseDate: z.string().date().optional(),
  currentValue: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  currentCurrency: z.string().length(3).optional(),
  customFields: z.record(z.string(), z.unknown()).default({}),
  tagIds: z.array(z.string().uuid()).default([]),
});
```

Custom field validation (dynamic): app layer fetch `category_fields`, validate `customFields` against schema before insert.

---

## 6. Pagination

**Cursor-based** untuk list (lebih stabil dari offset di mutasi tinggi).

```ts
input:  { cursor?: string, limit: number (max 100, default 50) }
output: { items: T[], nextCursor: string | null }
```

Cursor = `base64(JSON({ id, sortKey }))`.

---

## 7. Endpoint Reference

### 7.1 Auth (better-auth — `/api/auth/*`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/sign-up` | Register |
| POST | `/api/auth/sign-in` | Login |
| POST | `/api/auth/sign-out` | Logout |
| GET | `/api/auth/session` | Current session |
| POST | `/api/auth/verify-email` | Email verification |
| POST | `/api/auth/reset-password` | Reset |
| GET | `/api/auth/callback/google` | OAuth (V2) |

---

### 7.2 Workspaces (`workspaces.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `list` | query | – | `Workspace[]` |
| `get` | query | `{ slug }` | `Workspace & { role }` |
| `create` | mutation | `{ name, slug, displayCurrency, templateId? }` | `Workspace` |
| `update` | mutation | `{ slug, name?, settings? }` | `Workspace` |
| `delete` | mutation | `{ slug, confirm: string }` | `{ ok: true }` |
| `transferOwnership` | mutation | `{ slug, newOwnerId, confirm }` | `Workspace` |

**Permission**: list = protected · others = workspaceProcedure (delete/transfer = ownerProcedure)

---

### 7.3 Members (`members.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `list` | query | `{ workspaceSlug }` | `Member[] + Invitation[]` |
| `invite` | mutation | `{ workspaceSlug, email, role }` | `Invitation` |
| `acceptInvitation` | mutation | `{ token }` | `{ workspaceSlug }` |
| `revokeInvitation` | mutation | `{ workspaceSlug, invitationId }` | `{ ok }` |
| `resendInvitation` | mutation | `{ workspaceSlug, invitationId }` | `{ ok }` |
| `updateRole` | mutation | `{ workspaceSlug, memberId, role }` | `Member` |
| `remove` | mutation | `{ workspaceSlug, memberId }` | `{ ok }` |
| `leave` | mutation | `{ workspaceSlug }` | `{ ok }` |

**Permission**: invite/role/remove/revoke = ownerProcedure · leave = workspaceProcedure (block owner) · accept = protectedProcedure

---

### 7.4 Categories (`categories.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `list` | query | `{ workspaceSlug }` | `Category[]` |
| `get` | query | `{ workspaceSlug, id }` | `Category & { fields }` |
| `create` | mutation | `{ workspaceSlug, name, icon?, color? }` | `Category` |
| `update` | mutation | `{ workspaceSlug, id, ... }` | `Category` |
| `delete` | mutation | `{ workspaceSlug, id, reassignToCategoryId? }` | `{ ok, reassignedCount }` |

**Permission**: list/get = workspaceProcedure · mutations = editorProcedure

---

### 7.5 Category Fields (`fields.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `list` | query | `{ categoryId }` | `Field[]` |
| `create` | mutation | `{ categoryId, key, label, type, options?, required }` | `Field` |
| `update` | mutation | `{ id, label?, required?, options? }` | `Field` |
| `reorder` | mutation | `{ categoryId, orderedIds: string[] }` | `Field[]` |
| `delete` | mutation | `{ id }` | `{ ok }` (block kalau ada data) |

---

### 7.6 Owner Labels (`owners.*`) & Tags (`tags.*`)

Same CRUD pattern:

```
list   (query)  { workspaceSlug } → Item[]
create (mut)    { workspaceSlug, name, color } → Item
update (mut)    { workspaceSlug, id, name?, color? } → Item
delete (mut)    { workspaceSlug, id } → { ok }
```

---

### 7.7 Assets (`assets.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `list` | query | `{ workspaceSlug, cursor?, limit, filter? }` | `{ items, nextCursor }` |
| `get` | query | `{ workspaceSlug, id }` | `Asset & { children, tags, owner, category }` |
| `tree` | query | `{ workspaceSlug, rootId? }` | nested tree |
| `create` | mutation | `createAssetSchema` | `Asset` |
| `update` | mutation | `updateAssetSchema` | `Asset` |
| `archive` | mutation | `{ workspaceSlug, id }` | `Asset` |
| `unarchive` | mutation | `{ workspaceSlug, id }` | `Asset` |
| `setParent` | mutation | `{ workspaceSlug, id, parentId \| null }` | `Asset` |
| `assignTags` | mutation | `{ workspaceSlug, id, tagIds: string[] }` | `Asset` |
| `delete` | mutation | `{ workspaceSlug, id, confirm }` | `{ ok }` (owner only, hard delete) |

**Filter shape**:

```ts
filter: {
  search?: string,
  categoryIds?: string[],
  ownerLabelIds?: string[],
  statuses?: AssetStatus[],
  tagIds?: string[],
  valueMin?: string,
  valueMax?: string,
  valueCurrency?: string,
  parentAssetId?: string | null,
  customFields?: Record<string, unknown>,
  includeArchived?: boolean (default false),
  sortBy?: "name" | "createdAt" | "currentValue",
  sortDir?: "asc" | "desc",
}
```

**Permission**: list/get/tree = workspaceProcedure · mutations = editorProcedure · delete = ownerProcedure

---

### 7.8 Valuation (`valuation.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `list` | query | `{ workspaceSlug, assetId, cursor?, limit }` | `{ items, nextCursor }` |
| `chart` | query | `{ workspaceSlug, assetId, range: "1m"\|"3m"\|"1y"\|"all" }` | `{ points: [{date, value}] }` |
| `create` | mutation | `{ workspaceSlug, assetId, value, currency, valuedAt, note?, customFields? }` | `Valuation` |
| `update` | mutation | `{ workspaceSlug, id, ..., customFields? }` | `Valuation` |
| `delete` | mutation | `{ workspaceSlug, id }` | `{ ok }` |
| `bulkImportPreview` | mutation | `{ workspaceSlug, csvBase64 }` | `{ rows: [{row, asset, value, status, error?}] }` |
| `bulkImportConfirm` | mutation | `{ workspaceSlug, validRows: ImportRow[] }` | `{ insertedCount, failedCount }` |

**Permission**: list/chart = workspaceProcedure · mutations = editorProcedure

**Note `customFields`**: free-form `jsonb` (tidak gated oleh category schema seperti `assets`). Untuk capture appraiser, method, source URL, dll. Max 32 keys, max 4KB serialized.

---

### 7.9 Attachments (`attachments.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `list` | query | `{ workspaceSlug, assetId? }` | `Attachment[]` |
| `requestUploadUrl` | mutation | `{ workspaceSlug, assetId?, fileName, mimeType, sizeBytes }` | `{ uploadUrl, key, attachmentId }` |
| `confirmUpload` | mutation | `{ workspaceSlug, attachmentId }` | `Attachment` |
| `getDownloadUrl` | query | `{ workspaceSlug, attachmentId }` | `{ url, expiresAt }` |
| `delete` | mutation | `{ workspaceSlug, attachmentId }` | `{ ok }` |

**Flow**:
1. Client → `requestUploadUrl` (validate size, mime, quota) → return signed PUT URL.
2. Client PUT to object storage langsung.
3. Client → `confirmUpload` → finalize row, kasih activity log.

Download pakai short-lived signed URL (5 menit).

**Permission**: list/get = workspaceProcedure · upload/delete = editorProcedure

---

### 7.10 Activity (`activity.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `list` | query | `{ workspaceSlug, cursor?, limit, filter? }` | `{ items, nextCursor }` |
| `forAsset` | query | `{ workspaceSlug, assetId, cursor?, limit }` | `{ items, nextCursor }` |

Filter: `{ actorIds?, entityTypes?, actions?, dateFrom?, dateTo? }`

- `dateFrom`, `dateTo`: **ISO 8601 string** (e.g. `2026-05-01T00:00:00Z`). Server convert ke `timestamptz`.
- `actorIds`: array of user IDs (text, better-auth user.id).
- `entityTypes`: array of `asset`/`valuation`/`category`/`field`/`member`/`tag`/`owner_label`/`attachment`/`share`/`workspace`.
- `actions`: array of `create`/`update`/`archive`/`delete`/`reparent`/`bulk_import`/`invite`/`accept`/`role_change`/`remove`/`leave`/`upload`/`revoke`/`transfer`.

---

### 7.11 Dashboard (`dashboard.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `overview` | query | `{ workspaceSlug }` | `{ totalValue, displayCurrency, assetCount, growthPercent1M, ratesAvailable }` |
| `byCategory` | query | `{ workspaceSlug }` | `[{ categoryId, name, value, count, percent }]` |
| `byOwner` | query | `{ workspaceSlug }` | `[{ ownerLabelId, name, value, count, percent }]` |
| `growth` | query | `{ workspaceSlug, range }` | `{ points: [{date, value}] }` |
| `recentActivity` | query | `{ workspaceSlug, limit: 10 }` | `Activity[]` |

Aggregation: SQL query yang join valuation latest per asset, convert ke display_currency via exchange_rates.

---

### 7.12 Sharing (`sharing.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `list` | query | `{ workspaceSlug }` | `Share[]` |
| `create` | mutation | `{ workspaceSlug, scope: "workspace"\|"asset", targetId?, expiresAt? }` | `Share` |
| `update` | mutation | `{ workspaceSlug, id, expiresAt? }` | `Share` |
| `revoke` | mutation | `{ workspaceSlug, id }` | `{ ok }` |

**Permission**: ownerProcedure for all.

**Rate limit**: create max 10/hour per workspace.

---

### 7.13 Currency (`currency.*`)

| Procedure | Type | Input | Output |
|---|---|---|---|
| `listSupported` | query | – | `Currency[]` |
| `getRates` | query | `{ baseCurrency }` | `[{ from, to, rate, validFrom }]` |
| `manualOverride` | mutation | `{ workspaceSlug, from, to, rate }` | `ExchangeRate` (workspace-scoped manual rate) |

---

### 7.14 Public REST endpoints

#### `GET /api/public/:token`

```json
Response 200:
{
  "scope": "workspace" | "asset",
  "workspace": { "name", "displayCurrency", "totalValue", "assetCount" },
  "assets": [ ... ],         // if scope=workspace
  "asset": { ... }           // if scope=asset
}

Response 404:
{ "error": { "code": "NOT_FOUND", "message": "Link revoked or expired" } }
```

**Cache**: edge-cache 60s, invalidate on revoke.

**Hidden**: member info, activity, internal IDs (return slugs / shortened).

---

### 7.15 Internal Cron

#### `POST /api/webhooks/cron/rate-refresh`

Auth: header `X-Cron-Secret`.

Fetch dari frankfurter.app + CoinGecko → upsert ke `exchange_rates`.

Schedule: tiap 6 jam (Vercel Cron / external scheduler).

---

## 8. Rate Limiting

Pakai Upstash Rate Limit atau lokal (Redis/in-mem).

| Endpoint | Limit |
|---|---|
| `/api/auth/sign-up` | 5/hour/IP |
| `/api/auth/sign-in` | 10/15min/IP |
| `sharing.create` | 10/hour/workspace |
| `members.invite` | 50/hour/workspace |
| `attachments.requestUploadUrl` | 100/hour/user |
| `valuation.bulkImportConfirm` | 5/hour/workspace |
| `/api/public/:token` | 100/min/IP |
| Default | 1000/15min/user |

---

## 9. Concurrency & Idempotency

- **Mutations**: optimistic (no locking) untuk MVP. Trust last-write-wins.
- **Idempotency key** untuk `valuation.bulkImportConfirm` → client kirim `idempotencyKey` UUID; server dedupe 24 jam.
- **Asset update**: tambah `version` column nanti kalau perlu (V2). MVP: skip.

---

## 10. Caching

- **tRPC queries**: client-side cache via React Query (default).
- **Dashboard aggregations**: cache result 1 menit di server (Upstash / in-mem).
- **Currency rates**: cache 1 jam server-side.
- **Public share view**: edge cache 60s.

---

## 11. Logging & Observability

- **Structured log**: pino atau Vercel logs.
- **Trace request ID** untuk semua tRPC + REST.
- **Sentry** untuk error capture.
- **Audit log** sudah masuk DB (`activity_logs`) — terpisah dari app log.

---

## 12. API Versioning

MVP: tidak ada version prefix (`/api/...`). Kalau breaking change post-launch → `/api/v2/...` untuk REST. tRPC tidak butuh versioning (typed).

---

## 13. CORS

- App same-origin (Next.js).
- Public endpoint `/api/public/:token` → allow `*` (read-only).
- Webhook → allow only configured origin.

---

## 14. Changelog

- 0.3 — Audit fix: activity filter spec lengkap (ISO 8601 date format, actorIds = text, entityTypes/actions enumerated).
- 0.2 — Cross-doc fix: valuation procedures accept optional `customFields` jsonb (free-form, tidak gated). Note constraints (max 32 keys, max 4KB).
- 0.1 — Initial design. tRPC + REST split. 13 routers + auth + public + cron. Validation, pagination, rate limit, errors defined.
