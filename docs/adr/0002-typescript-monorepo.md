# 0002. TypeScript monorepo with a mainstream web stack

- Status: Accepted
- Date: 2026-10-12

## Context

The project relies heavily on AI-assisted development. AI agents are most productive on
popular, well-documented technology and when the whole system is visible in one place. The
data model must be shared exactly between UI, API and PDF generation.

## Decision

- One pnpm workspace monorepo: `apps/web`, `apps/api`, `packages/*`.
- TypeScript (strict) everywhere; ESM; Node 22+.
- Web: React + Vite. API: Fastify. Validation and types: Zod. Tests: Vitest.
- Internal packages export TS source directly; no inter-package build step.
- Image annotation (planned, once R6 images return): Konva via react-konva.

## Consequences

- One language for all contributors and agents; shared types end to end.
- If long-term maintenance moves to a team with a different stack, the API could be reimplemented
  against the same (JSON Schema exported) data model.
