# 0006. Start from a minimal domain

- Status: Accepted
- Date: 2026-10-15

Note (2026-10-19): the wireframes in `docs/wireframes` were removed once the base editor was
built. Read "the wireframes" below as "the editor screens".

Note (2026-10-19): fields have since been added back one at a time, as the Consequences below
allow: `Project.jobNumber`, `Workpack.module`, `Workpack.department`, `Workpack.revision` and
`Jobcard.jcNumber`, all optional free text, with `SCHEMA_VERSION` still 2. The lists below show the original minimal domain.

## Context

The first domain draft (schema v1) modelled everything we expected a jobcard to need: job number,
revision, status, location, discipline, scope, steps with details, images with annotations, R2S
viewpoints, content templates and audit fields. None of it was validated against real jobcards
or used by a screen, and the wireframes in `docs/wireframes` were cut back to a single field per
screen. We want to build the editor and the PDF template step by step, adding fields only when a
screen or the template needs them.

## Decision

- The domain holds only what the wireframes show:
  - `Project { schemaVersion, id, name, workpackIds }`
  - `Workpack { schemaVersion, id, title, jobcardIds }`
  - `Jobcard { schemaVersion, id, title, activities }`
  - `Activity { id, name }`, stored inside its jobcard. It replaces `Step`.
- Each parent owns the order of its children; there are no child→parent references.
- Everything else is removed from the code: audit fields, codes and numbers, location, discipline,
  scope, images, annotations, R2S viewpoints, content templates (schema, factory and the
  `content-templates` package).
- `SCHEMA_VERSION` goes from 1 to 2. No migration is written because no v1 data has been stored
  (there is no persistence yet, see ADR 0005).
- This overrides ADR 0001's reservation of `status` and `revision` on jobcards. They come back,
  with an ADR or schema change, when the review/approval flow is built.
- ADR 0004 (annotations as vector data) still applies when images are added again.
- The PDF renderer takes a `Jobcard` directly, without a separate render model.

## Consequences

- The schema is small enough to match the wireframes and the PDF template one field at a time.
- Requirements R4 (R2S), R5 (content templates) and R6 (images) are deferred to "Later (nice to
  have)" in `docs/requirements/README.md` and the roadmap. They, and the statuses and revisions of
  N4, get their schema only when they are picked up. Prefer additive, optional fields so stored
  data keeps validating.
- Whether an activity groups several detailed steps is still open (Q12, PR #3); `Activity` can be
  extended when that is decided.
