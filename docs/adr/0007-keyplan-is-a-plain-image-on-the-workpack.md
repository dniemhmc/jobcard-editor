# 0007. The keyplan is a plain image on the workpack, its bytes kept outside the records

- Status: Accepted
- Date: 2026-10-20

## Context

The cover page of a jobcard has a Keyplan box: a sketch of the platform with the module of the
jobcard highlighted. Today it is a picture pasted into the PowerPoint template. Each module has
its own sketch, so every jobcard of a workpack (the jobcards of one module) shows the same one.

Images were removed from the domain by ADR 0006 and come back with R6, with annotations stored as
vector data (ADR 0004). The keyplan is a smaller case: the user uploads a sketch that already has
the module highlighted, and the editor does not draw on it.

Records live as one JSON string in `localStorage` (limit about 5 MB, rewritten on every save). A
sketch of 1 to 3 MB does not fit there for more than a few workpacks, and every edit would rewrite
it. ADR 0005 already plans Azure Blob Storage for images, and the store will move to the API in
Phase 1b.

## Decision

- **Where it lives.** The keyplan belongs to the workpack, one per workpack (one per module):
  `Workpack.keyplan?: { assetId, mediaType, fileName? }`. It is optional and additive, so
  `SCHEMA_VERSION` stays 2 and no migration is needed. A workpack without one prints the empty
  Keyplan box as before.
- **No markup.** The image is used as uploaded. ADR 0004 does not apply to it; images with
  annotations (R6) come later with their own schema.
- **Only a reference in the record.** The record holds an `assetId`, the media type (PNG or JPEG)
  and the original file name for display. The bytes are not part of the schema.
- **Bytes in an `AssetStore`** (`apps/web/src/assets.ts`): `put`, `get` and `delete`, all async,
  next to `WorkspaceStore`. For now it is IndexedDB; the records stay in `localStorage`. In Phase 1b
  the API and Azure Blob (ADR 0005) take its place behind the same interface, and the schema does
  not change.
- **Write order.** The two stores are not saved together, so a saved record must never point to a
  missing image. The editor stores the image before it saves the workpack that points to it, and
  deletes an image only after the workpack without it was saved. A failure leaves at worst an
  unused image, never a dangling reference. Deleting a workpack or project deletes its images.
- **Upload rules.** PNG or JPEG only, not empty, at most 5 MB (`validateKeyplanFile`). SVG is
  refused on purpose. There is no resizing.
- **PDF.** `packages/pdf` takes the image as `SheetContext.keyplanSrc`. It prints it only if it is a
  `blob:` URL or a PNG or JPEG `data:` URI (`safeImageSrc`), and ignores anything else. The image
  is drawn with `object-fit: contain` in the box. The caller resolves the `assetId` to that source,
  so the domain and the renderer know nothing about storage.
- **The module stays free text.** `Workpack.module` is not tied to the sketch. A fixed list of
  modules per platform may come later.

## Consequences

- Records stay small and the editor behaves as before when a sketch is added.
- The workspace JSON no longer contains everything the editor shows. A future export or import
  must carry the assets too, and a backup of `localStorage` alone loses the images.
- IndexedDB is per browser, like `localStorage` is today; this is accepted until Phase 1b.
- A save that fails (storage full) can leave an unused image in IndexedDB. Nothing clears these
  yet; a sweep of images that no workpack refers to is a possible follow-up.
- A `blob:` URL only works in the browser that made it. Server-side PDF generation (Phase 1b,
  ADR 0003) must be given a fetchable URL or a `data:` URI for the image instead; `keyplanSrc`
  leaves room for that.
- The sketch and the module name are two inputs the author keeps consistent by hand.
- Open: the size and aspect ratio of real sketches (Q13).
