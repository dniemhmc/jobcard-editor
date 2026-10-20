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
Project { name, jobNumber? } ─< Workpack { title, module?, department?, revision?, date?, keyplan? } ─< Jobcard { title, jcNumber? } ─< Activity { name }
```

- Each parent owns the order of its children: `Project.workpackIds`, `Workpack.jobcardIds`,
  `Jobcard.activities`. There are no child→parent references.
- Project, Workpack and Jobcard are separate records carrying `schemaVersion` and `id`.
  Activities are stored inside their jobcard.
- `jobNumber`, `module`, `department`, `revision` and `jcNumber` are optional free text, entered by
  hand; `date` is an optional ISO date. The PDF looks them up
  from the project, workpack and jobcard when a sheet is drawn; they are not copied onto each
  jobcard (see the title block table in [domain.md](domain.md)).

## Images

The only image today is the keyplan of a workpack (ADR 0007). Records hold a reference
(`Workpack.keyplan = { assetId, mediaType, fileName? }`); the bytes live in an `AssetStore` in the
web app (`apps/web/src/assets.ts`): IndexedDB for now, the API and Azure Blob in Phase 1b, behind
the same interface. Records stay in `localStorage`.

- The editor writes in an order that never leaves a saved record pointing to a missing image: image
  first, then the workpack; an old image is deleted only after the workpack without it was saved.
- To draw a sheet, the editor turns the `assetId` into a `blob:` URL and passes it to the renderer as
  `SheetContext.keyplanSrc`. The renderer prints only `blob:` URLs and PNG or JPEG `data:` URIs.
- Annotated images (R6) are not built; they will follow ADR 0004.

## Status

| Part                       | Status                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| Domain schemas             | Minimal v2 plus optional fields, matching the editor screens (ADR 0006)                              |
| Content templates          | Removed for now (ADR 0006)                                                                           |
| PDF HTML renderer          | Cover and activity sheets with title block, no Chromium step yet                                     |
| API                        | Health check only, no persistence                                                                    |
| Web                        | Base editor: open project, tree, details forms, live preview; data in browser storage until Phase 1b |
| Image storage              | Keyplan images in IndexedDB behind `AssetStore`; API and Blob in Phase 1b (ADR 0007)                 |
| Persistence, auth, storage | Not started (see ADR 0005, open questions)                                                           |
