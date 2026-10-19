# Architecture

## Overview

```
 Browser (apps/web, React)                    Server (apps/api, Fastify)
 ┌──────────────────────────┐   HTTP/JSON    ┌───────────────────────────┐
 │ Editor UI                │ ─────────────▶ │ REST API                  │
 │ Tree + details forms     │                │ Validation (domain zod)   │
 │ Live preview             │                │ PDF render (Chromium)     │──▶ PostgreSQL (planned)
 └──────────────────────────┘                └───────────────────────────┘──▶ Object storage (planned)
            │                                              │
            └──────────────── shared: packages/domain, pdf ───────────────┘
                                                           │
                                                           ▼
                                                     R2S (integration TBD)
```

## Data model

Defined in `packages/domain/src` (Zod). Deliberately minimal: only what the editor screens show
(see ADR 0006). Fields are added as screens and the PDF template need them.

```
Project { name, jobNumber? } ─< Workpack { title, module? } ─< Jobcard { title, jcNumber? } ─< Activity { name }
```

- Each parent owns the order of its children: `Project.workpackIds`, `Workpack.jobcardIds`,
  `Jobcard.activities`. There are no child→parent references.
- Project, Workpack and Jobcard are separate records carrying `schemaVersion` and `id`.
  Activities are stored inside their jobcard.
- `jobNumber`, `module` and `jcNumber` are optional free text, entered by hand. The PDF looks them up
  from the project, workpack and jobcard when a sheet is drawn; they are not copied onto each
  jobcard (see the title block table in [domain.md](domain.md)).

## Status

| Part                       | Status                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| Domain schemas             | Minimal v2 plus optional fields, matching the editor screens (ADR 0006)                              |
| Content templates          | Removed for now (ADR 0006)                                                                           |
| PDF HTML renderer          | Cover and activity sheets with title block, no Chromium step yet                                     |
| API                        | Health check only, no persistence                                                                    |
| Web                        | Base editor: open project, tree, details forms, live preview; data in browser storage until Phase 1b |
| Persistence, auth, storage | Not started (see ADR 0005, open questions)                                                           |
