# Jobcard Editor

A web tool for creating offshore decommissioning **jobcards** and bundling them into
**workpacks**, replacing the PowerPoint-template workflow. It is the first building block of an
integrated Control of Work system.

## Quick start

Requires Node 22+ and pnpm (`corepack enable`).

```bash
pnpm install
pnpm dev      # web on http://localhost:5173, api on http://localhost:3001
pnpm check    # everything CI runs
```

## Documentation

- [CLAUDE.md](CLAUDE.md): working agreement for AI agents and developers
- [docs/domain.md](docs/domain.md): what jobcards, workpacks, etc. are
- [docs/architecture.md](docs/architecture.md): system design
- [docs/requirements/](docs/requirements/README.md): requirements
- [docs/roadmap.md](docs/roadmap.md): delivery plan
- [docs/adr/](docs/adr/): architecture decision records
- [docs/open-questions.md](docs/open-questions.md): open questions
- [docs/ideas.md](docs/ideas.md): loose ideas and directions, not commitments
- [docs/ai-workflow.md](docs/ai-workflow.md): how we develop with AI
