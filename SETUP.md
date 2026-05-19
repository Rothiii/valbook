# Setup Guide

Langkah lengkap untuk menjalankan Valbook dari nol.

Dua mode:
- **Quick start (slicing mode)** — lokalan saja, tanpa akun eksternal. Cocok untuk preview flow UI di browser.
- **Full setup** — lengkap dengan Neon, R2, Resend, Upstash, Sentry, Vercel. Wajib saat wiring tRPC + Drizzle (after slicing-first phase done).

---

## 0. Quick start (slicing mode) — paling minimal

Tidak butuh DB, email, storage, atau service eksternal. Semua state in-memory di browser via zustand + localStorage.

**Prereq**: Node 22 LTS + pnpm 10 + git.

```bash
git clone https://github.com/Rothiii/valbook.git
cd valbook
pnpm install
pnpm dev
```

Buka **http://localhost:3000** (atau port lain kalau di-set di `apps/web/.env.local`).

**Test flow**:
1. `/register` → fill form → token auto-redirect ke `/verify-email/[token]`
2. Klik "Go to login" → `/login` → masuk
3. `/onboarding` → pick template (e.g. Family Asset) → categories auto-seeded
4. Dashboard, asset CRUD, categories with custom fields, owner labels, tags, attachments (upload image up to 5MB), valuation history + CSV import + chart, member invite (mock token), public sharing
5. Data persisted di `localStorage`. Clear via DevTools → Application → Local Storage → hapus `valbook-*` keys

**Tidak perlu**:
- `.env.local` (semua env punya fallback placeholder)
- Database / Postgres
- Resend / SMTP
- R2 / S3
- Upstash Redis
- Sentry
- Vercel
- Domain

**Optional**: install git hooks supaya commit auto-lint:

```bash
pnpm lefthook install
```

Stop dev server: `Ctrl+C`.

---

## 1. Prerequisites (di mesin lokal — full setup)

- **Node.js 22 LTS** — verify: `node -v` harus `v22.x`
- **pnpm 10+** — install: `npm install -g pnpm` atau `corepack enable && corepack prepare pnpm@latest --activate`
- **Git** — verify: `git --version`
- **Editor** — VS Code rekomen dengan Biome + TypeScript extension

---

## 2. Clone & install

```bash
git clone https://github.com/Rothiii/valbook.git
cd valbook
pnpm install
```

Install lefthook git hooks:

```bash
pnpm lefthook install
```

---

## 3. Buat akun eksternal

Buat akun di service berikut **urut**. Setiap akun output credentials yang masuk ke `.env.local`.

### 3.1 Neon (Postgres database) — **wajib**

1. Daftar di https://neon.tech (free tier OK untuk dev)
2. Create project: nama `valbook`
3. Region: pilih `ap-southeast-1` (Singapore) untuk audience Indonesia
4. Connection string → tab **Dashboard → Connection Details**
5. Copy `Connection string` (pooled, recommended)

**Env vars**:
```
DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

**Catatan**: bikin 2 branch — `main` (production) dan `dev` (development). Switch via Neon dashboard.

---

### 3.2 Better-auth secret — **wajib**

Generate secret 32 byte random:

```bash
openssl rand -base64 32
```

Output contoh: `Xk9+aB7zQp...`

**Env vars**:
```
BETTER_AUTH_SECRET=<paste output di atas>
BETTER_AUTH_URL=http://localhost:3000
```

Production: ganti `BETTER_AUTH_URL` ke domain produksi.

---

### 3.3 Cloudflare R2 (object storage) — **wajib untuk attachment**

1. Daftar di https://dash.cloudflare.com
2. Sidebar → **R2 Object Storage** → enable (need credit card verification, free tier 10GB)
3. Create bucket: `valbook-dev` (dan `valbook-prod` saat deploy)
4. Bucket settings → **CORS Policy** → tambah:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
5. Sidebar → **API Tokens** → create token:
   - Permissions: Object Read & Write
   - Specify bucket: `valbook-dev` (atau all)
   - Save Access Key ID + Secret Access Key
6. Account ID: ada di sidebar kanan R2 dashboard

**Env vars**:
```
R2_ACCOUNT_ID=<account id>
R2_ACCESS_KEY_ID=<access key>
R2_SECRET_ACCESS_KEY=<secret key>
R2_BUCKET=valbook-dev
R2_PUBLIC_URL=https://pub-xxx.r2.dev  # (optional, kalau pakai R2 public URL)
```

---

### 3.4 Resend (email transactional) — **wajib untuk verify/invite email**

1. Daftar di https://resend.com (free tier: 3000 email/bulan)
2. Dashboard → **API Keys** → Create API key → "Sending access" full
3. Copy API key
4. **Domain verification**:
   - **Dev**: bisa langsung pakai `onboarding@resend.dev` (test only)
   - **Production**: tambah domain di Resend → konfigurasi DKIM/SPF/DMARC di registrar domain (Cloudflare/Namecheap)

**Env vars**:
```
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=onboarding@resend.dev  # dev only, ganti domain custom saat prod
```

---

### 3.5 Upstash Redis (cache + rate limit) — **wajib**

1. Daftar di https://upstash.com (free tier: 10K req/hari)
2. Console → **Create Database** → pilih region terdekat (Singapore)
3. Type: Regional (cheaper) atau Global (multi-region)
4. Tab **Details** → copy `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

**Env vars**:
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>
```

---

### 3.6 Sentry (error monitoring) — **rekomen tapi optional dev**

1. Daftar di https://sentry.io (free tier: 5K error/bulan)
2. Create project: platform `Next.js` → nama `valbook-web`
3. Copy DSN dari tab **Settings → Client Keys (DSN)**
4. Auth token untuk source map upload → **Settings → Auth Tokens** → create token dengan scope `project:releases`
5. Org slug + project slug → di URL Sentry

**Env vars**:
```
SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/yyy
NEXT_PUBLIC_SENTRY_DSN=<sama dengan SENTRY_DSN>
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=<org slug>
SENTRY_PROJECT=valbook-web
```

**Skip kalau dev only**: leave kosong, Sentry init no-op.

---

### 3.7 Cron secret — **wajib production, optional dev**

Generate random secret untuk verify Vercel cron call:

```bash
openssl rand -base64 32
```

**Env vars**:
```
CRON_SECRET=<paste output>
```

---

### 3.8 Vercel (hosting) — **saat siap deploy**

1. Daftar di https://vercel.com (login dengan GitHub recommended)
2. **Add New Project** → pilih repo `valbook`
3. Settings:
   - Framework: Next.js (auto-detect)
   - Root directory: `apps/web`
   - Build command: `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter web build`
   - Install command: `pnpm install --frozen-lockfile`
   - Output directory: `.next` (default)
4. **Environment Variables** → paste semua env vars di atas (kecuali `BETTER_AUTH_URL` ganti ke domain prod)
5. Deploy

**Custom domain** (optional Phase 6):
- Settings → Domains → Add
- Set A/CNAME record di registrar
- Update `BETTER_AUTH_URL` + `NEXT_PUBLIC_APP_URL` ke domain

---

### 3.9 Domain registrar (optional, untuk launch)

Pilih:
- **Cloudflare Registrar** — at-cost pricing
- **Namecheap** — UI bagus
- **Porkbun** — murah, no upsell

TLD priority: `.com` > `.id`/`.co.id` > `.app`

---

## 4. Buat file `.env.local`

Copy template:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`, isi semua nilai dari Step 3.

Minimal **untuk pertama kali run dev**:

```bash
DATABASE_URL=...                  # dari Neon (Step 3.1)
BETTER_AUTH_SECRET=...            # dari openssl (Step 3.2)
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_test            # bisa pakai test key dari Resend
RESEND_FROM_EMAIL=onboarding@resend.dev
UPSTASH_REDIS_REST_URL=...        # dari Upstash (Step 3.5)
UPSTASH_REDIS_REST_TOKEN=...      # dari Upstash
```

R2, Sentry, Cron bisa kosong dulu (akan ada fallback placeholder). Set saat fitur terkait dipakai.

---

## 5. Generate better-auth Drizzle schema

Setelah `DATABASE_URL` di-set, generate auth tables (user, session, account, verification):

```bash
cd apps/web
pnpm dlx @better-auth/cli generate --output src/features/auth/server/db.ts
```

Confirm prompt → tables di-generate sebagai Drizzle schema di file tersebut.

Import schema ke aggregator `src/server/db.ts`:

```ts
import * as authSchema from '@/src/features/auth/server/db';
const schema = { ...authSchema };
```

---

## 6. Push schema ke Neon

```bash
pnpm --filter web db:push
```

Atau generate migration file:

```bash
pnpm --filter web db:generate
pnpm --filter web db:migrate
```

---

## 7. Run dev server

```bash
pnpm dev
```

Buka http://localhost:3000

---

## 8. Verify everything

### 8.1 Auth flow

- Buka `/register` (akan dibuat Phase 1)
- Input email + password (min 8 char)
- Cek email inbox untuk verification link
- Klik link → akun aktif

### 8.2 Database

```bash
pnpm --filter web db:studio
```

Buka Drizzle Studio di browser, browse tables.

### 8.3 R2

Upload file via UI (Phase 4) atau test signed URL via curl.

### 8.4 Email

Cek Resend dashboard → **Logs** → email terkirim muncul.

### 8.5 Sentry

Trigger error test → cek Sentry dashboard apakah masuk.

---

## 9. Optional: deploy preview

Setelah commit + push ke `main`, Vercel auto-deploy. Cek deploy URL di Vercel dashboard.

---

## 10. Troubleshooting

### Build fail "DATABASE_URL is not set"

`.env.local` belum di-load atau `DATABASE_URL` kosong. Verify:

```bash
cd apps/web && cat .env.local | grep DATABASE_URL
```

### Email tidak terkirim

- Cek Resend API key valid di dashboard
- Verify `RESEND_FROM_EMAIL` — dev pakai `onboarding@resend.dev`, prod butuh domain verify
- Cek Resend logs untuk error detail (bounce, rejected, dll)

### R2 CORS error saat upload

Cek bucket CORS policy include origin yang sedang dipakai (`localhost:3000` untuk dev, domain produksi untuk prod).

### Drizzle migration error "relation does not exist"

Run `pnpm --filter web db:push` untuk apply schema, atau verify table sudah ada di Neon console.

### Better-auth "secret not configured"

`BETTER_AUTH_SECRET` kosong. Set di `.env.local`.

---

## 11. Env var reference

Lihat [apps/web/.env.example](apps/web/.env.example) untuk daftar lengkap.

Wajib (dev minimum):
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`

Wajib production:
- Semua di atas
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (domain verified)
- `R2_*` set lengkap
- `UPSTASH_REDIS_*`
- `CRON_SECRET`
- `SENTRY_*`

---

## 12. Useful scripts

| Script | Action |
|---|---|
| `pnpm dev` | Start Next.js dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | Biome lint check |
| `pnpm lint:fix` | Biome auto-fix |
| `pnpm format` | Biome format |
| `pnpm typecheck` | TypeScript check no emit |
| `pnpm test` | Vitest (Phase 1+) |
| `pnpm test:e2e` | Playwright (Phase 1+) |
| `pnpm --filter web db:generate` | Generate migration SQL |
| `pnpm --filter web db:push` | Push schema langsung ke DB (dev) |
| `pnpm --filter web db:migrate` | Apply migration file (prod) |
| `pnpm --filter web db:studio` | Open Drizzle Studio (browse tables) |
| `pnpm --filter web db:check` | Check migration drift |

---

## 13. Next steps

Setelah setup complete:
1. Read [CLAUDE.md](CLAUDE.md) untuk workflow + naming conventions
2. Read [docs/roadmap.md](docs/roadmap.md) untuk phase plan
3. Mulai Phase 1: ikuti [docs/phase-1-checklist.md](docs/phase-1-checklist.md)

---

## Changelog

- 0.1 — Initial setup guide. Account creation + env config + run dev + troubleshooting.
