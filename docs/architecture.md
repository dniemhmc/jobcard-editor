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

Defined in `packages/domain/src` (Zod). Deliberately minimal: only what the wireframes in
`docs/wireframes` show (see ADR 0006). Fields are added as screens and the PDF template need them.

```
Project { name } ─< Workpack { title } ─< Jobcard { title } ─< Activity { name }
```

- Each parent owns the order of its children: `Project.workpackIds`, `Workpack.jobcardIds`,
  `Jobcard.activities`. There are no child→parent references.
- Project, Workpack and Jobcard are separate records carrying `schemaVersion` and `id`.
  Activities are stored inside their jobcard.

## Status

| Part                       | Status                                         |
| -------------------------- | ---------------------------------------------- |
| Domain schemas             | Minimal v2, matching the wireframes (ADR 0006) |
| Content templates          | Removed for now (ADR 0006)                     |
| PDF HTML renderer          | Title + activities only, no Chromium step yet  |
| API                        | Health check only, no persistence              |
| Web                        | Placeholder page                               |
| Persistence, auth, storage | Not started (see ADR 0005, open questions)     |
