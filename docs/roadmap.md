# Roadmap

Deliver in thin vertical slices that real users can try. Every slice ends deployed to a test
environment and shown to 2–3 pilot users.

## Phase 0 – Discovery (now)

- [ ] Collect 10–20 real jobcards + the PowerPoint template into `fixtures/` (sanitized)
- [ ] Interview 3–5 jobcard authors; time how long a typical jobcard takes today (baseline)
- [ ] R2S technical spike: API, image export, viewpoint data, deep-link format
- [ ] IT constraints: hosting, SSO, data classification, offshore connectivity
- [ ] Validate `packages/domain` schemas against the real jobcards
- [ ] Resolve items in `open-questions.md`; record decisions as ADRs

## Phase 1 – Walking skeleton

- Persistence (PostgreSQL) and CRUD API for project / workpack / jobcard
- Editor: create jobcard from template, edit metadata and steps (add, edit, reorder, delete)
- Single jobcard PDF export that matches the current template (visual regression tests)
- Deploy to a test environment with SSO

## Phase 2 – Images

- Upload / paste / drag-and-drop images
- Annotations: highlight (rect, ellipse, polygon) + label with leader line
- Images and annotations rendered in PDF

## Phase 3 – Templates & workpacks

- All 25 content templates (content from engineering) + generic
- Organise jobcards in workpacks, reorder
- Workpack PDF: cover, index, all jobcards

## Phase 4 – R2S integration

- Pick an image from R2S, store viewpoint, "open in R2S" link in editor and PDF

## Later – toward Control of Work

- Review/approval workflow and revisions (status field already reserved)
- Read API / export for downstream systems
- Permitting, execution tracking
