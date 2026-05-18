# CLAUDE.md

Project guidance for Claude Code working on **Valbook** — Collaborative Asset Workspace Platform.

---

## Project Overview

Valbook is a workspace-based platform for recording, managing, visualising, and sharing asset data collaboratively. Supports personal wealth tracking, family asset management, company asset registry, portfolio monitoring, and lightweight ERP asset use cases.

**Core concept**: workspace contains members, assets, categories, custom fields, valuation history, attachments, and activity log. Shareable via public link.

**Status**: planning complete, Phase 0 not started yet.

---

## Documentation Map

Read these in order for full context:

1. [prd.md](prd.md) — master product requirement
2. [docs/roadmap.md](docs/roadmap.md) — 20-week phased plan
3. [docs/mvp-stories.md](docs/mvp-stories.md) — 75 user stories across 5 phases
4. [docs/erd.md](docs/erd.md) — 18-entity database design
5. [docs/api-design.md](docs/api-design.md) — tRPC + REST contract
6. [docs/permission-matrix.md](docs/permission-matrix.md) — role × action × resource
7. [docs/ux-flows.md](docs/ux-flows.md) — screen mockups + journey
8. [docs/tech-stack.md](docs/tech-stack.md) — pinned stack & infra
9. `docs/phase-<n>-checklist.md` — per-phase task list

Feature-specific PRDs live in [prd/](prd/).

---

## Workflow Rules

### New feature → mandatory pre-implementation flow

Before writing any code for a new feature:

1. **Think deeply** about the requirement — constraints, edge cases, blast radius, impact on existing data model, permissions, API surface.
2. **Discuss with user** — clarify ambiguity, propose 2-3 options with trade-offs, get alignment on direction.
3. **Invoke `write-a-prd` skill** — interview-based PRD generator at [agents/skills/write-a-prd/SKILL.md](agents/skills/write-a-prd/SKILL.md). Produces PRD with: Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes.
4. **Save PRD output** to `prd/<feature-slug>.md` (kebab-case, descriptive). Skill mentions GitHub issue — for this project, save as file instead (atau optional convert via `prd-to-issues` skill).
5. **Iterate** PRD with user until approved (multiple revision rounds OK).
6. **Optionally invoke `prd-to-issues`** to break approved PRD into actionable tickets.
7. **Implement** following TDD discipline ([agents/skills/tdd/SKILL.md](agents/skills/tdd/SKILL.md)) and phase checklist.
8. **Update master docs** (erd, api-design, permission-matrix, mvp-stories) if feature changes them.

### Bug fix → skip PRD

For bug fix:
1. Reproduce the bug
2. Identify root cause (read code, check git blame, run failing test)
3. Fix + add regression test
4. Commit with `fix:` prefix

No PRD required. No design discussion needed unless fix reveals architectural issue.

### Refactor / chore

Minor: skip PRD, commit with `refactor:` or `chore:` prefix.

Major refactor (>3 files, schema migration, dependency change): treat as feature, use PRD flow.

---

## Naming Conventions

### Language

**All identifiers in English** — code, DB, files, branches, comments, internal docs. Indonesian only for user-facing UI text (managed via i18n source files `messages/id.json`).

### Database (Postgres + Drizzle)

| Element | Convention | Example |
|---|---|---|
| Tables (app-managed) | `snake_case`, **plural** | `workspaces`, `assets`, `categories` |
| Tables (better-auth managed) | `snake_case`, **singular** | `user`, `session`, `account`, `verification` |
| Columns | `snake_case` | `created_at`, `workspace_id` |
| Foreign keys | `<entity>_id` | `workspace_id`, `owner_label_id` |
| Boolean columns | `is_*`, `has_*`, `can_*` | `is_builtin`, `is_archived` |
| Timestamp columns | `*_at` (timestamptz) | `created_at`, `archived_at`, `valued_at` |
| JSON columns | descriptive | `custom_fields`, `settings`, `definition` |
| Enum types | `<table>_<column>_enum` | `asset_status_enum` |
| Indexes | `idx_<table>_<columns>` | `idx_assets_workspace_status` |
| Unique indexes | `uniq_<table>_<columns>` or `idx_*` with comment | `idx_assets_code_per_workspace` |
| Migration files | `<timestamp>_<slug>.sql` (Drizzle auto) | `0001_initial_schema.sql` |

### TypeScript

| Element | Convention | Example |
|---|---|---|
| Files | `kebab-case.ts` | `auth-client.ts`, `asset-router.ts` |
| Folders | `kebab-case/` | `routers/`, `lib/schema/` |
| React components | `PascalCase.tsx` | `AssetForm.tsx`, `WorkspaceSwitcher.tsx` |
| Variables | `camelCase` | `currentUser`, `assetList` |
| Functions | `camelCase` | `getUserById`, `createWorkspace` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE`, `DEFAULT_LOCALE` |
| Types / Interfaces | `PascalCase` | `Workspace`, `AssetCreateInput` |
| Hooks | `useCamelCase` | `useCurrentWorkspace`, `useAssetList` |
| Zod schemas | `<verb><Entity>Schema` | `createAssetSchema`, `updateWorkspaceSchema` |
| Enums | `PascalCase` keys, `snake_case` values | `AssetStatus.Active = "active"` |

### Function naming patterns

| Pattern | Use case | Example |
|---|---|---|
| `getX(id)` | Fetch single | `getAssetById`, `getWorkspaceBySlug` |
| `listX(filter)` | Fetch many | `listAssets`, `listMembers` |
| `createX(input)` | Insert | `createAsset` |
| `updateX(id, patch)` | Update | `updateAsset` |
| `deleteX(id)` | Hard delete | `deleteWorkspace` |
| `archiveX(id)` | Soft delete | `archiveAsset` |
| `isX`, `hasX`, `canX` | Boolean check | `isOwner`, `canEditAsset` |
| `assertX` | Throw on fail | `assertWorkspaceMember` |
| Action verb | Side effect | `sendInvitationEmail`, `revokeShare` |

### Git

- **Branches**: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`, `refactor/<slug>`
- **Commits**: Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`
- Subject ≤ 60 char, imperative mood ("add", not "added")
- Body explains **why**, not what (diff already shows what)
- PR title matches commit convention
- Co-author trailer for AI assistance

---

## Code Style

- **Biome** enforces format + lint (`pnpm biome check`)
- 2-space indent, single quotes, no semicolons trailing (Biome decides)
- No `console.log` in production code — use structured logger (pino)
- No `any` — use `unknown` + narrow with zod or type guard
- Drizzle queries only — no raw SQL via template literal (parameterized = safe)
- No `try/catch` swallowing — log + rethrow or handle explicitly
- Default to **no comments** — only comment WHY when non-obvious
- Don't write multi-line docstring — short single-line if needed
- Error boundary around component tree, not per component
- Prefer `async/await` over `.then()`

---

## Permission Enforcement

Every tRPC procedure must declare permission tier:

- `publicProcedure` — no auth
- `protectedProcedure` — require session
- `workspaceProcedure(slug)` — require member of workspace
- `editorProcedure` — role >= editor
- `ownerProcedure` — role === owner

No exceptions. See [docs/permission-matrix.md](docs/permission-matrix.md) for rules.

Every mutation must write `activity_logs` entry transactionally with the main change.

---

## Agent Usage Patterns

### Project-local skills ([agents/skills/](agents/skills/))

- **`write-a-prd`** — interview-based PRD generator. Use for every new feature (mandatory per workflow above).
- **`prd-to-issues`** — break approved PRD into actionable GitHub issues.
- **`tdd`** — TDD discipline reference (interface design, mocking, refactoring, tests). Use during implementation.
- **`triage-issue`** — issue prioritisation helper.
- **`improve-codebase-architecture`** — refactor planning for structural improvement.
- **`grill-me`** — adversarial code review.

### Built-in agents

- **`Plan`** — design / architecture decisions, multi-step implementation planning (when not using `write-a-prd`).
- **`Explore`** — read-only codebase search across >3 files, "where is X defined", "which files reference Y".
- **`general-purpose`** — complex multi-step research that may need to write notes.

### Rules

- Run agents in **parallel** when independent (single message, multiple Agent calls)
- Brief agent like a smart colleague who just walked in — full context, exact paths, expected output format

---

## Tooling Quick Reference

- Package manager: **pnpm** (use `pnpm add`, never `npm install`)
- Run dev: `pnpm dev`
- Type check: `pnpm tsc --noEmit`
- Lint + format: `pnpm biome check --write`
- Test unit: `pnpm vitest`
- Test e2e: `pnpm playwright test`
- DB migration: `pnpm drizzle-kit generate` + `pnpm drizzle-kit push`
- DB seed: `pnpm db:seed`

---

## Memory & User Preferences

- **Caveman mode** active globally (sessionstart hook) — terse responses, drop articles/filler, fragments OK. Code/commits/security: write normal.
- User name: Rafid. Email: hairian@planet-it.co.id.
- Always confirm destructive ops (git force, DB drop, file rm) before executing.

---

## When in doubt

1. Read the doc map above
2. Search code with Explore agent
3. Ask user before assuming
4. Default to **smaller scope, fewer abstractions** — don't add features beyond what task requires

---

## Changelog

- 2026-05-18 — Initial CLAUDE.md. Workflow rules (write-a-prd skill for features, skip for bug fix), naming conventions, agent usage referencing project skills, tooling.
