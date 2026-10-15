# Roadmap

Deliver in thin vertical slices that real users can try. Every slice ends deployed to a test
environment and shown to 2–3 pilot users.

## Phase 0 – Discovery (now)

- [ ] Collect 10–20 real jobcards + the PowerPoint template into `fixtures/` (sanitized)
- [ ] Interview 3–5 jobcard authors; time how long a typical jobcard takes today (baseline)
- [ ] IT constraints: hosting, SSO, data classification, offshore connectivity
- [ ] Validate `packages/domain` schemas against the real jobcards
- [ ] Resolve items in `open-questions.md`; record decisions as ADRs

## Phase 1 – Walking skeleton

- Persistence (PostgreSQL) and CRUD API for project / workpack / jobcard
- Editor: edit project, workpacks, jobcards and activities (add, edit, reorder, delete)
- Single jobcard PDF export that matches the current template (visual regression tests)
- Deploy to a test environment with SSO

## Phase 2 – Workpacks

- Organise jobcards in workpacks, reorder
- Workpack PDF: cover, index, all jobcards

## Later – nice to have

Deferred requirements (see `docs/requirements/README.md`). Each gets its data model only when it
is picked up (ADR 0006).

- R6 Images: upload / paste / drag-and-drop; annotations (highlight + label with leader line);
  rendered in PDF
- R5 Content templates: 25 prefilled templates (content from engineering) + generic
- R4 R2S integration: pick an image from R2S, store viewpoint, "open in R2S" link in editor and PDF

## Later – toward Control of Work

- Review/approval workflow and revisions
- Read API / export for downstream systems
- Permitting, execution tracking
