# 0004. Image annotations are stored as vector data, not burned into pixels

- Status: Accepted; applies when images with annotations (R6) return, see 0006. The keyplan is a
  plain image without markup and is not covered by it, see 0007
- Date: 2026-10-12

## Context

Users highlight and label objects on photos. In PowerPoint this markup is separate shapes on the
slide. We need markup to stay editable, to render crisply in PDF, and to be usable as data later
(e.g. "which jobcards mark this lifting point").

## Decision

- The original image is stored unchanged as an `Asset`.
- Annotations are a list of typed objects (`highlight`, `label`) on the `JobcardImage`, with
  coordinates normalised to 0..1 of the image width/height.
- Rendering (editor canvas, PDF SVG overlay) is done from this data.

## Consequences

- Annotations remain editable forever and scale to any output size.
- Every renderer must implement each annotation type; new types are added to the schema first.
