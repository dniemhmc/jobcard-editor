# Developing with AI

This project is built mostly by AI coding agents (Claude Code) with humans owning direction,
the data model, UX decisions and review.

## Loop

1. **Issue.** Write a GitHub issue using the _Feature / slice_ template with concrete acceptance
   criteria. Small: one vertical slice, ideally reviewable in < 30 minutes.
2. **Implement.** Point an agent at the issue. It reads `CLAUDE.md`, works on a branch, runs
   `pnpm check`, and opens a PR.
3. **Review.** AI review first (e.g. `/code-review`), then human review. Humans check especially:
   schema changes, UX, anything touching work-instruction content.
4. **Try it.** Pilot users try the slice; feedback becomes new issues.

## What makes the AI effective here

- **Context in the repo**: `CLAUDE.md`, `docs/`, ADRs, and real examples in `fixtures/`.
  When an agent gets something wrong because it lacked context, fix the docs, not just the code.
- **Guardrails**: strict TypeScript, Zod validation, lint, tests, CI. Planned: Playwright
  end-to-end tests and visual regression tests of PDF output against approved references.
- **Mainstream stack**: TypeScript, React, Fastify, PostgreSQL. AI performs best on well-known tech.
- **Decisions recorded as ADRs** so agents don't re-litigate them.

## Cloud sessions

`.claude/hooks/session-start.sh` installs dependencies at the start of every Claude Code cloud
session so agents can run `pnpm check`.
