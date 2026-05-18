# Entity Relationship Design

# Collaborative Asset Workspace Platform

Version: 0.5 (Draft — iterating)
Source PRD: [../prd.md](../prd.md)
Stack assumption: PostgreSQL + Drizzle ORM

---

## 1. Design Principles

1. **Hybrid schema** — kolom statis untuk field universal, JSONB untuk custom field per-kategori.
2. **Multi-currency safe** — simpan original currency, convert on read.
3. **Audit-first** — semua mutasi penting masuk `activity_logs`.
4. **Workspace-scoped** — hampir semua entity diikat ke `workspace_id` untuk isolation & cascade.
5. **Soft delete untuk asset** — pakai `archived_at`, hard delete hanya untuk workspace.

---

## 2. Entity List

### Identity & Workspace

#### 2.1 `user` (managed by better-auth)

**Tidak handle manual**. Auto-generated oleh better-auth dengan tabel: `user`, `session`, `account`, `verification`. Lihat section 2.18 untuk detail. Semua FK di dokumen ini yang refer ke "user" mengacu ke `user.id` (singular) dari better-auth schema.

Extended fields (via better-auth `additionalFields`):
| Column | Type | Notes |
|---|---|---|
| name | text | display name |
| avatar_url | text | nullable |

Standard fields dari better-auth: `id` (text PK), `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`.

#### 2.2 `workspaces`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| slug | text UNIQUE | URL-safe |
| owner_id | text → user.id | |
| settings | jsonb | display_currency, locale, dll |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### 2.3 `workspace_members`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid → workspaces (CASCADE) | |
| user_id | text → user.id (CASCADE) | |
| role | enum (`owner`,`editor`,`viewer`) | |
| joined_at | timestamptz | |

UNIQUE(workspace_id, user_id)

#### 2.4 `workspace_invitations`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid → workspaces (CASCADE) | |
| email | citext | |
| role | enum (`editor`,`viewer`) | owner ga bisa di-invite |
| token | text UNIQUE | crypto-random |
| invited_by | text → user.id | |
| expires_at | timestamptz | |
| accepted_at | timestamptz | nullable |

---

### Taxonomy

#### 2.5 `categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid → workspaces (CASCADE) | |
| name | text | |
| icon | text | nullable |
| color | text | hex |
| created_at | timestamptz | |

UNIQUE(workspace_id, name)

#### 2.6 `category_fields`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| category_id | uuid → categories (CASCADE) | |
| key | text | slug, immutable |
| label | text | mutable |
| type | enum (`text`,`number`,`date`,`select`,`multi_select`,`boolean`,`url`,`currency`) | |
| options | jsonb | array of strings untuk select |
| required | boolean | |
| sort_order | int | |

UNIQUE(category_id, key)

#### 2.7 `owner_labels`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid → workspaces (CASCADE) | |
| name | text | "Ayah", "PT XYZ", "Joint" |
| color | text | |

#### 2.8 `tags`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid → workspaces (CASCADE) | |
| name | text | |
| color | text | |

UNIQUE(workspace_id, name)

---

### Asset Core

#### 2.9 `assets`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid → workspaces (CASCADE) | |
| parent_asset_id | uuid → assets (SET NULL) | self-ref |
| category_id | uuid → categories (RESTRICT) | |
| owner_label_id | uuid → owner_labels (SET NULL) | nullable |
| name | text | |
| code | text | serial/SKU, nullable. **Unique per workspace ketika tidak null** (lihat indexes section 5) |
| status | enum (`active`,`archived`,`sold`,`lost`,`disposed`) | |
| location | text | nullable |
| notes | text | nullable |
| purchase_price | numeric(20,8) | nullable |
| purchase_currency | char(3) → currencies | nullable |
| purchase_date | date | nullable |
| current_value | numeric(20,8) | denormalized from latest valuation |
| current_currency | char(3) → currencies | |
| current_value_updated_at | timestamptz | |
| custom_fields | jsonb | per-category dynamic data |
| archived_at | timestamptz | soft delete |
| created_by | text → user.id | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### 2.10 `asset_tags`
| Column | Type | Notes |
|---|---|---|
| asset_id | uuid → assets (CASCADE) | |
| tag_id | uuid → tags (CASCADE) | |

PK(asset_id, tag_id)

---

### History & Events

#### 2.11 `valuation_history`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| asset_id | uuid → assets (CASCADE) | |
| value | numeric(20,8) | |
| currency | char(3) → currencies | |
| valued_at | timestamptz | |
| source | enum (`manual`,`import`,`market`) | |
| note | text | nullable |
| custom_fields | jsonb | free-form metadata: appraiser, method, source_url. Default `{}`. **Max 32 keys, max 4KB serialized**. |
| created_by | text → user.id | |
| created_at | timestamptz | |

#### 2.12 `transactions` *(V2 — deferred)*
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| asset_id | uuid → assets (CASCADE) | |
| type | enum (`buy`,`sell`,`transfer`,`maintenance`,`income`,`expense`) | |
| amount | numeric(20,8) | |
| currency | char(3) → currencies | |
| occurred_at | timestamptz | |
| counterparty | text | nullable |
| note | text | nullable |
| custom_fields | jsonb | extra data per-type (invoice no, vendor, dll) |
| created_by | text → user.id | |

**Scope**: V2. Tidak masuk MVP. Tabel diserahkan di-skip migrate sampai V2.

#### 2.13 `activity_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid → workspaces (CASCADE) | |
| actor_id | text → user.id (SET NULL) | |
| entity_type | text | `asset`,`category`,`member`,... |
| entity_id | uuid | |
| action | text | `create`,`update`,`archive`,... |
| diff | jsonb | before/after snapshot |
| created_at | timestamptz | |

---

### File & Sharing

#### 2.14 `attachments`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid → workspaces (CASCADE) | |
| asset_id | uuid → assets (CASCADE) | nullable (workspace-level file) |
| file_url | text | object storage key |
| file_name | text | |
| mime_type | text | |
| size_bytes | bigint | |
| uploaded_by | text → user.id | |
| created_at | timestamptz | |

#### 2.15 `public_shares`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workspace_id | uuid → workspaces (CASCADE) | |
| scope | enum (`workspace`,`asset`) | |
| target_id | uuid | workspace_id or asset_id |
| token | text UNIQUE | crypto-random 32+ byte |
| permission | enum (`view`) | MVP view-only |
| expires_at | timestamptz | nullable |
| created_by | text → user.id | |
| revoked_at | timestamptz | nullable |
| created_at | timestamptz | |

---

### Currency

#### 2.16 `currencies`
| Column | Type | Notes |
|---|---|---|
| code | char(3) PK | ISO 4217 + crypto codes |
| name | text | |
| symbol | text | |
| decimal_places | int | 2 fiat, 8 crypto |

#### 2.17 `exchange_rates`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| from_currency | char(3) → currencies | |
| to_currency | char(3) → currencies | |
| rate | numeric(20,8) | |
| valid_from | timestamptz | |
| source | enum (`manual`,`api`) | |

UNIQUE(from_currency, to_currency, valid_from)

---

### System (managed by better-auth)

#### 2.18 better-auth tables
Auto-generated oleh **better-auth**. Jangan di-handle manual:
- `user` — extended dengan `name`, `avatar_url` via `additionalFields`. Source of truth identity (lihat 2.1).
- `session` — managed sessions
- `account` — OAuth provider link (untuk Google OAuth V2)
- `verification` — email verification token + password reset token

Migration handling: gunakan better-auth CLI / generator. Jangan tulis migration manual untuk 4 tabel ini.

---

### Workspace Templates

#### 2.19 `workspace_templates`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | "Real Estate", "Crypto Portfolio", "Office Equipment", "Blank" |
| description | text | |
| icon | text | |
| is_builtin | boolean | seed data = true; user-defined = false (V2) |
| definition | jsonb | { categories: [{ name, icon, color, fields: [...] }] } |
| created_by | text → user.id | nullable (null untuk builtin) |
| created_at | timestamptz | |

**Behavior**: pas user create workspace + pilih template → materialize categories + category_fields ke tabel real. Template tidak di-link permanen; copy-on-create. Blank template = no-op.

Builtin templates (seed):
- **Blank** — kosong, user define sendiri
- **Personal Wealth** — Tabungan, Saham, Crypto, Emas, Property
- **Family Asset** — Rumah, Kendaraan, Elektronik, Furniture, Koleksi
- **Office Equipment** — Laptop, Monitor, Peripheral, Furniture, Lisensi Software
- **Real Estate** — Tanah, Rumah, Apartemen, Ruko
- **Crypto Portfolio** — Bitcoin, Ethereum, Altcoin, Stablecoin

---

## 3. Hybrid Schema Strategy

**Static columns** (`assets`): name, code, price, value, status, location → fast query, normal indexes.

**Dynamic `custom_fields` jsonb**:
- Schema didefinisikan di `category_fields`
- App-layer validation pas insert/update pakai field definition
- Query pakai operator JSONB + GIN index

Contoh:
```sql
SELECT * FROM assets
WHERE workspace_id = $1
  AND custom_fields @> '{"chip": "M3"}';
```

---

## 4. Multi-Currency Strategy

- **Tidak auto-convert** saat insert. Simpan original currency.
- **Convert on read** pakai latest rate dari `exchange_rates`.
- **Dashboard aggregation** → konversi ke `workspaces.settings.display_currency`.
- **NUMERIC(20,8)** cukup untuk fiat + crypto.

### Rate seeding (MVP)

- **Provider**: frankfurter.app (free, ECB-backed fiat) untuk fiat. CoinGecko free tier untuk crypto.
- **Scheduled refresh**: cron job tiap 6 jam tarik rate baru, insert row baru ke `exchange_rates` dengan `valid_from = now()` dan `source = 'api'`.
- **Manual override**: user boleh insert manual rate (`source = 'manual'`) untuk currency obscure / personal valuation.
- **Read query**: ambil rate dengan `valid_from <= now()` terbaru per pasangan from/to.
- **Fallback**: jika rate ga ada, dashboard tampilkan warning "rate unavailable" untuk aset bersangkutan, jangan crash.

---

## 5. Indexes

```sql
-- Hot path
CREATE INDEX idx_assets_workspace ON assets(workspace_id, status);
CREATE INDEX idx_assets_category ON assets(workspace_id, category_id);
CREATE INDEX idx_assets_parent ON assets(parent_asset_id) WHERE parent_asset_id IS NOT NULL;
CREATE UNIQUE INDEX idx_assets_code_per_workspace ON assets(workspace_id, code) WHERE code IS NOT NULL;
CREATE INDEX idx_valuation_asset_time ON valuation_history(asset_id, valued_at DESC);
CREATE INDEX idx_transactions_asset_time ON transactions(asset_id, occurred_at DESC);
CREATE INDEX idx_activity_workspace ON activity_logs(workspace_id, created_at DESC);
CREATE INDEX idx_members_user ON workspace_members(user_id);

-- Lookup
CREATE UNIQUE INDEX idx_invitations_token ON workspace_invitations(token);
CREATE UNIQUE INDEX idx_shares_token ON public_shares(token);

-- JSONB
CREATE INDEX idx_assets_custom ON assets USING GIN (custom_fields);

-- Search (future full-text)
CREATE INDEX idx_assets_name_trgm ON assets USING GIN (name gin_trgm_ops);
```

---

## 6. Cascade & Integrity Rules

| Parent delete | Child behavior |
|---|---|
| workspace | CASCADE all children |
| asset (parent) | child asset → `parent_asset_id = NULL` |
| category | RESTRICT if assets exist |
| owner_label | SET NULL on asset |
| user (workspace owner) | BLOCK until ownership transferred |
| currency | RESTRICT |

---

## 7. Critical Edge Cases

1. **Soft delete asset** — `archived_at` timestamp. List query default filter out.
2. **Workspace ownership transfer** — dedicated endpoint, audit log mandatory.
3. **Custom field rename** — `key` immutable post-create; `label` mutable.
4. **Field type change** — block if data exists; force user create new field.
5. **Latest valuation denorm** — `assets.current_value` updated on valuation insert via trigger atau app logic.
6. **Public share token** — 32+ byte crypto-random, rate-limit endpoint, never expose `created_by`.
7. **Invitation accepted** — convert to `workspace_members` row in transaction, mark `accepted_at`.
8. **Concurrent valuation insert** — last-write-wins per `valued_at` timestamp; UI tampilkan ordered list.
9. **Valuation bulk import (CSV)** — endpoint terima CSV (asset_code, value, currency, valued_at, note); per-row validate, return error report; insert dalam batch transaction.
10. **Dashboard archived exclude** — semua aggregation query default `WHERE archived_at IS NULL`. Filter "include archived" opt-in.
11. **Child asset different category** — parent dan child boleh punya category beda (e.g., Rumah > AC). Validasi tidak enforce kesamaan.
12. **Template materialize** — pas create workspace, copy `definition.categories[]` jadi rows di `categories` + `category_fields`. Setelah copy, putus link — user bebas modify.

---

## 8. ER Diagram

```mermaid
erDiagram
    users ||--o{ workspaces : owns
    users ||--o{ workspace_members : member_of
    workspaces ||--o{ workspace_members : has
    workspaces ||--o{ workspace_invitations : invites
    workspaces ||--o{ categories : has
    workspaces ||--o{ owner_labels : has
    workspaces ||--o{ tags : has
    workspaces ||--o{ assets : contains
    workspaces ||--o{ activity_logs : logs
    workspaces ||--o{ public_shares : exposes
    workspaces ||--o{ attachments : stores
    categories ||--o{ category_fields : defines
    categories ||--o{ assets : classifies
    owner_labels ||--o{ assets : assigns
    assets ||--o{ assets : parent_of
    assets ||--o{ valuation_history : tracks
    assets ||--o{ transactions : records
    assets ||--o{ attachments : has
    assets }o--o{ tags : tagged_by
    currencies ||--o{ exchange_rates : from
    currencies ||--o{ exchange_rates : to
    currencies ||--o{ assets : prices
    currencies ||--o{ valuation_history : denominates
    currencies ||--o{ transactions : denominates
    workspace_templates ||..o{ workspaces : seeds
```

---

## 9. Resolved Decisions

| # | Topic | Decision |
|---|---|---|
| 1 | Auth | **better-auth** managed. Pakai tabel `user`/`session`/`account`/`verification` auto-generated. |
| 2 | Owner label | Free string, workspace-scoped master. Tidak link ke user account. |
| 3 | Multi-currency | **Seed dari API** day-1 (frankfurter + CoinGecko), refresh tiap 6 jam. Manual override boleh. |
| 4 | Transactions | **V2**, skip migrate di MVP. |
| 5 | Custom fields di transactions | Pakai `jsonb` (untuk V2). |
| 6 | Workspace template | **Both** — pre-built (Blank, Personal Wealth, Family, Office, Real Estate, Crypto) + Blank. User-defined template = V2. |
| 7 | Dashboard archived | **Exclude** by default; opt-in filter. |
| 8 | Child asset category | **Boleh beda** dari parent. No enforcement. |
| 9 | Tags vs owner_label | Tags = attribute barang (multi-value). Owner_label = kepemilikan (single value). Tetap pisah. |
| 10 | Valuation entry | Manual + **CSV bulk import** di MVP. Auto sync market price = V2. |

## 9b. Still Open (Tech Detail — Bahas Saat Implementasi)

- **Asset code uniqueness** — per workspace atau per category? (default: per workspace, nullable)
- **Attachment storage** — S3 / R2 / Supabase Storage? Pilih saat infra setup.
- **Search** — trigram cukup untuk MVP; pgvector V2.

---

## 10. Changelog

- **0.5** — Audit fix: FK ke user → `text → user.id` (better-auth user.id text, bukan uuid). Asset `code` inline comment uniqueness. Valuation `custom_fields` constraint 32 keys / 4KB.
- **0.4** — Asset code uniqueness scope confirmed: per workspace, nullable. Tambah `UNIQUE INDEX (workspace_id, code) WHERE code IS NOT NULL`.
- **0.3** — Cross-doc consistency fix. Dropped manual `users` schema 2.1, full deferral ke better-auth `user` table. All FK references → `user`. Added `custom_fields jsonb` ke valuation_history.
- **0.2** — Resolved 10 open questions. Better-auth adopted (drop manual `sessions`). Added `workspace_templates` entity + 6 builtin seeds. Transactions marked V2 + `custom_fields jsonb` added. Multi-currency: API seed strategy (frankfurter + CoinGecko, 6h refresh). Valuation CSV bulk import edge case added. Dashboard archived exclusion confirmed.
- **0.1** — Initial draft, 18 entities, hybrid schema, multi-currency, soft-delete.
