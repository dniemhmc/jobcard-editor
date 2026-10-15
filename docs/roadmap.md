# Roadmap

Deliver in thin vertical slices that real users can try. Every slice ends deployed to a test
environment and shown to 2–3 pilot users.

## Current focus

Phase 1a: build the jobcard PDF template step by step on the minimal domain (ADR 0006). Each step
adds one field or section to the schema, the editor and the PDF together, checked against the
current PowerPoint template. Discovery (Phase 0) runs alongside.

## Phase 0 – Discovery (ongoing)

- [ ] Collect 10–20 real jobcards + the PowerPoint template into `fixtures/` (sanitized)
- [ ] Interview 3–5 jobcard authors; time how long a typical jobcard takes today (baseline)
- [ ] IT constraints: hosting, SSO, data classification, offshore connectivity
- [ ] Validate `packages/domain` schemas against the real jobcards
- [ ] Resolve items in `open-questions.md`; record decisions as ADRs

## Phase 1a – Jobcard + PDF, built step by step

- Grow the domain one field at a time, only as the template needs it (additive, optional fields)
- Editor: edit project, workpacks, jobcards and activities (add, edit, reorder, delete)
- Single jobcard PDF that matches the current template, with live preview (visual regression tests)

## Phase 1b – Persistence and deployment

- Persistence (PostgreSQL) and CRUD API for project / workpack / jobcard
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
