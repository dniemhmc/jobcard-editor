# CLAUDE.md

Guidance for AI coding agents (and humans) working in this repository. Read this first.

## What this is

A web-based **jobcard editor** for offshore platform decommissioning. It replaces the current
workflow of filling in a PowerPoint template per jobcard. It is the first building block of a
future integrated **Control of Work** system (planning, permitting, execution, tracking), so the
**structured data is the product** and the editor and the PDF are views of that data.

Read before doing non-trivial work:

- `docs/domain.md`: domain glossary and how jobcards are used today
- `docs/architecture.md`: system overview and package layout
- `docs/adr/`: decisions already made. **Do not reopen them silently**: propose a new ADR instead
- `docs/requirements/README.md`: requirements and their ids
- `docs/roadmap.md`: what is being built now vs later
- `docs/open-questions.md`: known unknowns; do not invent answers to these

## Commands

```bash
pnpm install          # install everything
pnpm dev              # web (http://localhost:5173) + api (http://localhost:3001)
pnpm check            # format:check + lint + typecheck + test (run before every commit)
pnpm test             # all unit tests (vitest)
pnpm exec vitest run packages/domain   # tests for one package
pnpm format           # fix formatting
```

## Layout

| Path              | Purpose                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| `packages/domain` | Zod schemas = **single source of truth** for all data, plus pure domain logic |
| `packages/pdf`    | Jobcard / workpack → printable HTML (→ PDF via headless Chromium)             |
| `apps/api`        | Fastify HTTP API                                                              |
| `apps/web`        | React + Vite editor UI                                                        |
| `fixtures/`       | Sanitized real-world examples (jobcards, the PowerPoint template)             |

Internal packages export TypeScript source directly (`"exports": "./src/index.ts"`); there is no
build step between packages.

## Rules

- **Schema first.** Any new data starts as a Zod schema in `packages/domain`. Derive TS types with
  `z.infer`; never hand-write a duplicate type. Validate all data crossing a boundary (API input,
  file import, DB read) with the schema.
- **Schema changes are high-impact.** Stored data and downstream systems depend on them. Prefer
  additive, optional fields. A breaking change needs `SCHEMA_VERSION` bumped, a migration, and an
  ADR. Call out schema changes explicitly in the PR.
- **Annotations are vector data** with normalised (0..1) coordinates. Never burn edits into image
  pixels (ADR 0004).
- **PDF output is generated from data** by `packages/pdf`. Escape every interpolated value with
  `escapeHtml`.
- `packages/domain` (non-test code) must stay browser-safe: no Node-only APIs.
- Content templates contain offshore work instructions. **Never invent or change step content**
  in an `approved` template; that is owned by engineering. Placeholder content must be clearly
  marked and the template left in `draft`.
- Keep pure logic out of React components and route handlers so it can be unit-tested.
- Inject time and id generation (`now`, `newId`) into domain functions for deterministic tests.
- Every change ships with tests. Bug fix → first a failing test.
- Use mainstream, well-documented libraries. Adding a dependency needs a reason in the PR.
- Small PRs: one issue / one vertical slice per PR.

## Conventions

- TypeScript strict mode, ESM, single quotes, Prettier defaults in `.prettierrc.json`.
- File names `kebab-case.ts`; React components `PascalCase.tsx`.
- Tests live next to the code as `*.test.ts`.
- User-facing language: British/International English, domain terms as in `docs/domain.md`.
