# Roadmap

Deliver in thin vertical slices that real users can try. Every slice ends deployed to a test
environment and shown to 2–3 pilot users.

Loose ideas that are not planned yet live in [ideas.md](ideas.md) until they are promoted here.

## Current focus

Phase 1a: build the jobcard PDF template step by step on the minimal domain (ADR 0006). Each step
adds one field or section to the schema, the editor and the PDF together, checked against the
layout template. Discovery (Phase 0) runs alongside.

## Phase 0 – Discovery (ongoing)

- [ ] Dries provides the jobcard layout template (into `fixtures/`); fields are added to it one step
      at a time in Phase 1a
- [ ] Interview 3–5 jobcard authors; time how long a typical jobcard takes today (baseline)
- [x] IT constraints: hosting, SSO, offshore connectivity (Q1, Q2, Q5); data classification assumed
      (Q10)
- [ ] Validate `packages/domain` schemas against the layout template
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
  - Oracle Primavera Cloud export
  - 4D planner export
- Reviewer mode
- Permitting, execution tracking
- Read-only tablet app for offshore crews to read jobcards (Q5)
