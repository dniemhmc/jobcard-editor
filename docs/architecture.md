# Architecture

## Overview

```
 Browser (apps/web, React)                    Server (apps/api, Fastify)
 ┌──────────────────────────┐   HTTP/JSON    ┌───────────────────────────┐
 │ Editor UI                │ ─────────────▶ │ REST API                  │
 │ Image annotation (Konva) │                │ Validation (domain zod)   │
 │ Live preview             │                │ PDF render (Chromium)     │──▶ PostgreSQL (planned)
 └──────────────────────────┘                └───────────────────────────┘──▶ Object storage (planned)
            │                                              │
            └──────── shared: packages/domain, content-templates, pdf ────┘
                                                           │
                                                           ▼
                                                     R2S (integration TBD)
```

## Data model

Defined in `packages/domain/src` (Zod). Summary:

```
Project ─< Workpack (ordered jobcardIds) ─< Jobcard ─< Step
                                              ├─< JobcardImage ── Asset (original file)
                                              │      ├─ source: upload | r2s(viewpoint, deepLink)
                                              │      └─ annotations: highlight | label (normalised coords)
                                              ├─ status, revision, location, discipline, scope
                                              └─ contentTemplate { id, version }
```

All persisted top-level records carry `schemaVersion` and `audit` fields.

## Status

| Part                       | Status                                          |
| -------------------------- | ----------------------------------------------- |
| Domain schemas             | Draft v1, to validate against real jobcards     |
| Content template registry  | Done (generic + 1 example draft)                |
| PDF HTML renderer          | Placeholder layout, no Chromium step yet        |
| API                        | Health + content templates only, no persistence |
| Web                        | Placeholder page                                |
| Persistence, auth, storage | Not started (see ADR 0005, open questions)      |
