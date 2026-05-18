# MVP Feature Prioritisation & User Stories

# Collaborative Asset Workspace Platform

Version: 0.3
Source: [prd.md](../prd.md) + [erd.md](erd.md)

---

## Legend

| Priority | Meaning |
|---|---|
| **P0** | Blocker MVP launch. Wajib done. |
| **P1** | Should-have MVP. Boleh geser max 2 minggu. |
| **P2** | Nice-to-have. Push V2 kalau time tight. |

| Phase | Window |
|---|---|
| Phase 0 | Week 1–2 — Foundation |
| Phase 1 | Week 3–7 — MVP Core (+1w karena mobile-equal) |
| Phase 2 | Week 8–12 — Dynamic + Collab (+1w) |
| Phase 3 | Week 13–14 — Valuation + Dashboard |
| Phase 4 | Week 15–16 — Attachment + Activity + Search |
| Phase 5 | Week 17–18 — Public Sharing |
| Phase 6 | Week 19–20 — Polish + Launch |

**Catatan**: timeline updated dari 18 → **20 minggu** karena keputusan mobile + desktop equal priority. Phase 1 dan Phase 2 paling impact (form layout, navigasi, table → card list).

---

## Definition of Done (template)

Story selesai jika:

- [ ] Implementation done (frontend + backend + DB)
- [ ] Validasi input (zod schema)
- [ ] Permission check sesuai matrix
- [ ] Error handling (4xx/5xx) + user-friendly message
- [ ] Loading state + empty state
- [ ] Activity log tercatat (untuk mutasi)
- [ ] Unit test happy + edge case minimal 1
- [ ] Manual QA di browser (golden path)
- [ ] Tidak break existing test
- [ ] Code review approved

---

## Phase 0 — Foundation (Week 1–2)

Bukan user story. Setup task:

- [ ] Init Next.js (app router) + TypeScript
- [ ] Postgres + Drizzle setup
- [ ] better-auth integration
- [ ] Object storage account (S3/R2 — TBD)
- [ ] Migration framework + initial schema dari [erd.md](erd.md)
- [ ] Seed: currencies, workspace_templates (6 builtin)
- [ ] CI: lint, typecheck, test
- [ ] Deploy preview environment
- [ ] Permission matrix doc finalisasi (docs/permission-matrix.md)
- [ ] tRPC atau REST API decision

---

## Phase 1 — MVP Core (Week 3–6)

### Epic: Authentication

| ID | Story | Priority |
|---|---|---|
| AUTH-01 | Sebagai user baru, saya mau register pakai email + password | P0 |
| AUTH-02 | Sebagai user, saya mau login dengan kredensial | P0 |
| AUTH-03 | Sebagai user, saya mau logout | P0 |
| AUTH-04 | Sebagai user, saya mau verify email lewat link | P0 |
| AUTH-05 | Sebagai user, saya mau reset password lewat email | P1 |
| AUTH-06 | Sebagai user, saya mau login dengan Google OAuth | P2 |

**Acceptance AUTH-01**:
- Form validasi: email valid, password min 8 char
- Email belum terdaftar → success + kirim verification email
- Email sudah terdaftar → error "email already registered"
- Password di-hash (bcrypt/argon2 via better-auth)
- Redirect ke `/onboarding` setelah register

**Acceptance AUTH-04**:
- Klik link verification → mark `user.emailVerified = true`
- Token expired (24 jam) → error + tombol resend
- Unverified user tidak bisa create workspace

---

### Epic: Workspace Management

| ID | Story | Priority |
|---|---|---|
| WS-01 | Sebagai user, saya mau create workspace dari template (pre-built atau blank) | P0 |
| WS-02 | Sebagai user, saya mau switch antar workspace | P0 |
| WS-03 | Sebagai user, saya mau lihat list workspace saya | P0 |
| WS-04 | Sebagai owner, saya mau edit nama + settings workspace | P0 |
| WS-05 | Sebagai owner, saya mau delete workspace (hard) | P0 |
| WS-06 | Sebagai owner, saya mau transfer ownership ke member lain | P1 |

**Acceptance WS-01**:
- Pilih template dari list (6 builtin + Blank)
- Input nama workspace + slug (auto-generate, editable)
- Set `display_currency` (default IDR)
- Submit → buat workspace + materialize template categories + fields
- Owner auto jadi member dengan role `owner`
- Redirect ke workspace dashboard

**Acceptance WS-05**:
- Confirm modal dengan ketik nama workspace
- CASCADE delete: members, categories, assets, valuation, attachment, dll
- Audit log entry sebelum delete
- File attachment di object storage juga dihapus

---

### Epic: Asset Management (Basic)

| ID | Story | Priority |
|---|---|---|
| AST-01 | Sebagai member (editor+), saya mau create asset dengan field dasar | P0 |
| AST-02 | Sebagai member (editor+), saya mau edit asset | P0 |
| AST-03 | Sebagai member (editor+), saya mau archive asset | P0 |
| AST-04 | Sebagai member, saya mau lihat detail asset | P0 |
| AST-05 | Sebagai member, saya mau lihat list asset dengan pagination | P0 |
| AST-06 | Sebagai member (editor+), saya mau unarchive asset | P1 |
| AST-07 | Sebagai owner, saya mau hard delete asset (sangat hati-hati) | P2 |

**Acceptance AST-01**:
- Form fields: name (required), category (required), code, owner_label, status, location, notes, purchase_price + currency + date, current_value + currency
- Validasi currency dari `currencies` table
- Default `current_value = purchase_price` kalau kosong
- Insert + tulis activity log `asset.create`
- Redirect ke detail page

---

### Epic: Category (Static MVP)

| ID | Story | Priority |
|---|---|---|
| CAT-01 | Sebagai member (editor+), saya mau create category | P0 |
| CAT-02 | Sebagai member (editor+), saya mau edit category (name, icon, color) | P0 |
| CAT-03 | Sebagai member (editor+), saya mau delete category (dengan reassign asset) | P0 |
| CAT-04 | Sebagai user, saya mau lihat list category | P0 |

**Acceptance CAT-03**:
- Cek apakah ada asset pakai kategori ini
- Kalau ada → modal pilih kategori pengganti, bulk update assets, baru delete
- Kalau tidak ada → langsung delete

---

## Phase 2 — Dynamic + Collab (Week 7–10)

### Epic: Dynamic Category Fields

| ID | Story | Priority |
|---|---|---|
| CAT-05 | Sebagai member (editor+), saya mau add custom field ke category | P0 |
| CAT-06 | Sebagai member (editor+), saya mau edit field label + required | P0 |
| CAT-07 | Sebagai member (editor+), saya mau reorder field | P1 |
| CAT-08 | Sebagai member (editor+), saya mau delete field (block kalau ada data) | P0 |
| AST-08 | Sebagai member (editor+), form asset create/edit dynamic ikut field category | P0 |
| AST-09 | Detail asset tampilkan custom field sesuai schema | P0 |

**Acceptance CAT-05**:
- Field types: text, number, date, select, multi_select, boolean, url, currency
- `key` auto-generate dari label (slug), editable sebelum save, immutable setelah save
- `required` flag
- Select/multi_select → input options array
- Sort_order auto = max+1

**Acceptance AST-08**:
- Pilih category → fetch fields → render form input sesuai type
- Validasi: required field, type check, select option valid
- Simpan ke `assets.custom_fields` jsonb
- Edit category fields setelah ada asset → existing asset tetap pakai data lama, validasi loose

---

### Epic: Collaboration / Membership

| ID | Story | Priority |
|---|---|---|
| MEM-01 | Sebagai owner, saya mau invite member via email + assign role | P0 |
| MEM-02 | Sebagai invitee, saya mau accept invitation via email link | P0 |
| MEM-03 | Sebagai invitee, saya mau decline / ignore invitation | P1 |
| MEM-04 | Sebagai owner, saya mau ubah role member | P0 |
| MEM-05 | Sebagai owner, saya mau remove member | P0 |
| MEM-06 | Sebagai member, saya mau leave workspace | P0 |
| MEM-07 | Sebagai owner, saya mau lihat pending invitation + revoke | P0 |

**Acceptance MEM-01**:
- Input email + role (editor/viewer)
- Cek apakah email sudah jadi member → error
- Insert `workspace_invitations` + generate token + send email
- Email berisi accept link dengan token
- Token expire 7 hari

---

### Epic: Owner Label

| ID | Story | Priority |
|---|---|---|
| OWN-01 | Sebagai member (editor+), saya mau create owner label | P0 |
| OWN-02 | Sebagai member (editor+), saya mau edit owner label | P0 |
| OWN-03 | Sebagai member (editor+), saya mau delete owner label | P0 |
| OWN-04 | Sebagai member (editor+), saya mau assign owner label ke asset | P0 |

---

### Epic: Asset Hierarchy

| ID | Story | Priority |
|---|---|---|
| HIER-01 | Sebagai member (editor+), saya mau set parent untuk asset | P0 |
| HIER-02 | Sebagai member, saya mau lihat asset tree (parent + children) | P0 |
| HIER-03 | Sebagai member (editor+), saya mau remove parent (jadi root) | P0 |
| HIER-04 | Sebagai member, lihat breadcrumb di detail asset | P1 |

**Acceptance HIER-01**:
- Dropdown parent picker (search asset di workspace yang sama)
- Block circular reference (asset tidak boleh jadi parent dari ancestor-nya)
- Child boleh punya category beda dari parent
- Update aksi → tulis activity log `asset.reparent`

---

## Phase 3 — Valuation + Dashboard (Week 11–12)

### Epic: Valuation History

| ID | Story | Priority |
|---|---|---|
| VAL-01 | Sebagai member (editor+), saya mau tambah valuation entry ke asset | P0 |
| VAL-02 | Sebagai member, saya mau lihat history valuation chart per asset | P0 |
| VAL-03 | Sebagai member (editor+), saya mau edit valuation entry | P1 |
| VAL-04 | Sebagai member (editor+), saya mau delete valuation entry | P1 |
| VAL-05 | Sebagai member (editor+), saya mau bulk import valuation via CSV | P0 |

**Acceptance VAL-01**:
- Input: value, currency, valued_at (default now), note
- Insert + update `assets.current_value`, `current_currency`, `current_value_updated_at` (kalau valued_at >= existing)
- Tulis activity log

**Acceptance VAL-05**:
- Upload CSV (columns: asset_code, value, currency, valued_at, note)
- Parse + validate per row
- Tampilkan preview + error report (row mana fail kenapa)
- Confirm → insert batch dalam transaction
- Update `assets.current_value` setelah batch done

---

### Epic: Dashboard

| ID | Story | Priority |
|---|---|---|
| DASH-01 | Sebagai member, lihat total nilai asset (workspace level) | P0 |
| DASH-02 | Sebagai member, lihat distribusi by category (pie/bar) | P0 |
| DASH-03 | Sebagai member, lihat distribusi by owner label | P0 |
| DASH-04 | Sebagai member, lihat growth chart total over time | P0 |
| DASH-05 | Sebagai owner, set display_currency workspace | P0 |
| DASH-06 | Sebagai member, lihat recent activity (last 10) | P0 |
| DASH-07 | Sebagai member, lihat asset count per status | P1 |

**Acceptance DASH-01**:
- Query semua asset `archived_at IS NULL`
- Convert `current_value` ke `display_currency` pakai latest rate
- Tampilkan total + breakdown per currency original
- Kalau rate ga ada untuk currency tertentu → tampilkan warning

---

### Epic: Currency Management

| ID | Story | Priority |
|---|---|---|
| CUR-01 | Sebagai member, lihat list exchange rate current | P1 |
| CUR-02 | Sebagai owner, manual override exchange rate | P1 |
| CUR-03 | Background: cron 6h refresh rates dari API | P0 |

---

## Phase 4 — Attachment + Activity + Search (Week 13–14)

### Epic: Attachment

| ID | Story | Priority |
|---|---|---|
| ATT-01 | Sebagai member (editor+), upload attachment ke asset | P0 |
| ATT-02 | Sebagai member, lihat list attachment per asset | P0 |
| ATT-03 | Sebagai member, download attachment (signed URL) | P0 |
| ATT-04 | Sebagai member (editor+), delete attachment | P0 |
| ATT-05 | Preview gambar inline | P1 |
| ATT-06 | Preview PDF inline | P2 |

**Acceptance ATT-01**:
- Upload file max 25MB
- Allowed mime: image/*, application/pdf, application/msword, dll
- Generate object storage key: `{workspace_id}/{asset_id}/{uuid}.{ext}`
- Insert `attachments` row
- Validate size + mime sebelum upload (signed URL request)

---

### Epic: Tags

| ID | Story | Priority |
|---|---|---|
| TAG-01 | Sebagai member (editor+), create tag di workspace | P0 |
| TAG-02 | Sebagai member (editor+), assign multiple tags ke asset | P0 |
| TAG-03 | Sebagai member (editor+), remove tag dari asset | P0 |
| TAG-04 | Sebagai member (editor+), edit / delete tag | P1 |

---

### Epic: Activity Log

| ID | Story | Priority |
|---|---|---|
| LOG-01 | Sebagai member, lihat activity log workspace (paginated) | P0 |
| LOG-02 | Sebagai member, lihat activity log per asset | P0 |
| LOG-03 | Filter activity by actor / entity type / action / date range | P1 |

---

### Epic: Search & Filter

| ID | Story | Priority |
|---|---|---|
| SRC-01 | Sebagai member, search asset by name + code (trigram) | P0 |
| SRC-02 | Sebagai member, filter by category, owner, status, tags | P0 |
| SRC-03 | Sebagai member, filter by value range | P1 |
| SRC-04 | Sebagai member, filter by custom field value | P1 |
| SRC-05 | Sebagai member, save filter sebagai view | P2 |

---

## Phase 5 — Public Sharing (Week 15–16)

### Epic: Sharing

| ID | Story | Priority |
|---|---|---|
| SHR-01 | Sebagai owner, generate public link untuk workspace | P0 |
| SHR-02 | Sebagai owner, generate public link untuk asset specific | P0 |
| SHR-03 | Sebagai owner, set link expiry | P0 |
| SHR-04 | Sebagai owner, revoke public link | P0 |
| SHR-05 | Sebagai owner, lihat list active public link | P0 |
| PUB-01 | Sebagai anonymous visitor, view public workspace (read-only) | P0 |
| PUB-02 | Sebagai anonymous visitor, view public asset (read-only) | P0 |

**Acceptance SHR-01**:
- Generate 32-byte crypto-random token
- Insert `public_shares` row dengan scope=workspace
- Copy-to-clipboard link
- Rate-limit endpoint generate (max 10/jam per workspace)

**Acceptance PUB-01**:
- Akses `/public/{token}` → fetch share + workspace
- Cek `revoked_at IS NULL` + `expires_at > now() OR expires_at IS NULL`
- Render read-only view: asset list, kategori, owner label, value
- HIDE: member list, activity log detail, sharing config, edit buttons
- Tidak expose internal IDs di URL

---

## Phase 6 — Polish + Launch (Week 17–18)

- [ ] Empty states untuk semua list (workspace, asset, valuation, activity)
- [ ] Onboarding tour 3-step (setelah register)
- [ ] Error pages: 404, 403, 500
- [ ] Loading skeletons konsisten
- [ ] Mobile responsive audit
- [ ] Accessibility audit (axe-core scan minimum)
- [ ] Performance: bundle size, query optimization
- [ ] Rate limiting + abuse protection (signup, public link)
- [ ] Monitoring: Sentry / Logtail
- [ ] Analytics: PostHog / Plausible
- [ ] Privacy policy + ToS page
- [ ] Production deploy
- [ ] Beta invite list

---

## Out of Scope (V2+)

| Feature | Reason |
|---|---|
| Transactions tabel | Geser V2 — kompleks, butuh accounting context |
| Realtime collab | Tidak masuk core promise |
| Auto-sync market price | Manual + CSV import cukup MVP |
| Approval workflow | Enterprise feature, kompleks |
| AI insights | Geser jauh, butuh data dulu |
| Depreciation engine | Specific use case, kompleks |
| User-defined workspace template | Builtin cukup MVP |
| Saved filter view | Nice-to-have, defer |

---

## Cross-Cutting Requirements

| Area | Requirement |
|---|---|
| **i18n** | MVP: Indonesia + English. Pakai next-intl. |
| **Locale** | Date format, number format ikut locale |
| **Timezone** | Simpan UTC, display di local TZ user |
| **Security** | CSRF, rate-limit, SQL injection prevention (Drizzle parameterized), XSS sanitization |
| **Backup** | Daily DB snapshot. Object storage versioning. |
| **GDPR-ish** | User dapat delete account → cascade workspace yang dia owner-only |

---

## Story Count Summary

| Phase | Stories | P0 | P1 | P2 |
|---|---:|---:|---:|---:|
| 1 — Core | 20 | 17 | 2 | 1 |
| 2 — Dynamic+Collab | 17 | 14 | 3 | 0 |
| 3 — Valuation+Dashboard | 13 | 8 | 5 | 0 |
| 4 — Attachment+Search | 18 | 12 | 5 | 1 |
| 5 — Sharing | 7 | 7 | 0 | 0 |
| **Total** | **75** | **58** | **15** | **2** |

---

## Changelog

- 0.3 — Timeline geser 18 → 20 minggu (mobile + desktop equal priority dari tech-stack decision).
- 0.2 — Cross-doc fix: LOG-03 add date range filter (sync dengan api-design.md).
- 0.1 — Initial breakdown. 75 stories across 5 phases.
