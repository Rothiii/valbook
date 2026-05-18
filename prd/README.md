# Feature PRDs

Folder ini berisi PRD (Product Requirement Document) per-fitur untuk **Valbook**.

---

## Kapan bikin PRD di sini

PRD baru wajib untuk **setiap fitur baru** sebelum implementasi dimulai.

Lihat [../CLAUDE.md](../CLAUDE.md) section **Workflow Rules → New feature** untuk flow lengkap.

**Tidak perlu PRD untuk**:
- Bug fix
- Refactor minor (<3 files, no schema change)
- Chore / dependency bump
- Docs update

---

## File naming

`<feature-slug>.md` — kebab-case, descriptive.

Contoh:
- `multi-currency-export.md`
- `realtime-asset-presence.md`
- `bulk-asset-import.md`
- `notification-center.md`

---

## Bikin PRD via `write-a-prd` skill

Pakai skill di [../agents/skills/write-a-prd/SKILL.md](../agents/skills/write-a-prd/SKILL.md). Flow:

1. User invoke skill atau Claude proactive trigger saat user describe feature baru
2. Skill interview user untuk problem detail + solusi
3. Skill explore codebase verify asumsi
4. Skill drill down setiap branch design decision
5. Skill sketch module + interface (favor deep modules testable in isolation)
6. Skill output PRD pakai template di bawah

**Override**: skill default submit ke GitHub issue. Untuk project ini, **save sebagai file** di `prd/<feature-slug>.md`. Optional convert ke GitHub issue belakangan via `prd-to-issues` skill.

---

## PRD template (output `write-a-prd` skill)

Section minimum dari skill:

```markdown
# <Feature Name>

Version: 0.1
Status: Draft | Review | Approved | Implemented | Deprecated
Author: <name>
Created: YYYY-MM-DD
Target phase: Phase X / V2

## Problem Statement
The problem the user is facing, from the user's perspective.

## Solution
The solution, from the user's perspective.

## User Stories
Long numbered list. Format: "As a <actor>, I want a <feature>, so that <benefit>".

## Implementation Decisions
- Modules to build / modify
- Interface signatures (no file paths or code snippets — too volatile)
- Technical clarifications
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

## Testing Decisions
- What makes a good test (external behavior, not implementation detail)
- Modules to be tested
- Prior art / similar tests in codebase

## Out of Scope
Things explicitly deferred or not part of this PRD.

## Further Notes
Anything else.

## Changelog
- 0.1 — Initial draft
```

---

## Extended template (optional — kompleks feature)

Untuk feature yang menyentuh banyak area (multi-entity schema change, permission redesign, ops impact), tambahkan section berikut **setelah skill drafted core**:

```markdown
## Data Model Impact
ERD addition / change. Migration plan.

## API Changes
New / changed endpoint. Request/response shape.

## Permission Impact
Role × action × resource update. Reference [../docs/permission-matrix.md](../docs/permission-matrix.md).

## UX Flow
Wireframe / mockup / state diagram for primary journey.

## Edge Cases
Race condition, concurrency, large data, network failure, etc.

## Performance / Scale Consideration
Query plan, index, cache strategy.

## Security Consideration
Input validation, rate limit, audit log, data exposure.

## Rollout Plan
Feature flag? Phased rollout? Migration sequence?

## Telemetry / Observability
Metric, log, alert to add.

## Open Questions
Items needing decision before implementation.
```

---

## Status lifecycle

```
Draft → Review → Approved → Implemented → (Deprecated)
```

- **Draft**: WIP, masih diskusi
- **Review**: siap di-review user / stakeholder
- **Approved**: sign-off, ready to implement
- **Implemented**: shipped to production
- **Deprecated**: tidak lagi berlaku, archive

---

## Hubungan dengan master docs

Setelah PRD **Approved** dan implementasi mulai:

- Update [../docs/erd.md](../docs/erd.md) kalau ada perubahan schema
- Update [../docs/api-design.md](../docs/api-design.md) kalau ada endpoint baru
- Update [../docs/permission-matrix.md](../docs/permission-matrix.md) kalau ada role/action baru
- Update [../docs/mvp-stories.md](../docs/mvp-stories.md) kalau story masuk MVP
- Update [../docs/ux-flows.md](../docs/ux-flows.md) kalau ada journey baru
