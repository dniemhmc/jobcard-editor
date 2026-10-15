# 0001. The jobcard is structured data; editor and PDF are views

- Status: Accepted, amended by 0006 (`status` and `revision` removed until needed)
- Date: 2026-10-12

## Context

Jobcards are currently PowerPoint slides exported to PDF. The content cannot be reused by other
systems. The editor is meant to be the first building block of an integrated Control of Work
system, which needs to query, reference and track jobcards and their steps.

## Decision

- A jobcard is stored as a validated, versioned structured record (see `packages/domain`).
- The editor UI and the PDF are both generated from this record. The PDF is never edited by hand.
- Zod schemas in `packages/domain` are the single source of truth for the data model. JSON Schema
  for downstream consumers can be generated from them.
- Every persisted top-level record carries `schemaVersion`; breaking changes require a version
  bump and a migration.
- Jobcards reserve `status` and `revision` from the start for the later review/approval flow.

## Consequences

- Downstream systems can consume jobcards without parsing documents.
- Layout freedom is lower than in PowerPoint: the layout is defined by the PDF template, users
  fill in content. This is intentional (consistency) but must be validated with users.
- Schema changes need care; they are reviewed explicitly.
