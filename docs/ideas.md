# Ideas

A place for loose ideas and directions for the app, written down as they come up. **Nothing here
is a commitment.** An idea becomes planned work only when it is moved into the
[roadmap](roadmap.md) or the [requirements](requirements/README.md).

AI agents: do not build from this file or treat an idea as a requirement. Mention a relevant idea
when it touches the work at hand, and leave it to Dries to promote it.

## How to use

Add a new entry at the top of [Entries](#entries) with the date, a short title, one or two lines
on the thought, and a status:

| Status        | Meaning                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| **raw**       | Just written down, not thought through yet                                      |
| **exploring** | Being looked into or discussed                                                  |
| **promoted**  | Moved into the roadmap or requirements; add a link to where it went             |
| **dropped**   | Decided against; add a short reason so it does not get reconsidered by accident |

Keep entries short. When an idea needs more room (a sketch, a longer argument), give it its own
file in `docs/` and link to it from the entry.

Template:

```markdown
### YYYY-MM-DD: Short title

**Status:** raw

One or two lines on the idea.
```

## Entries

### 2026-10-17: Low-friction feedback in the early-access version

**Status:** raw

Build a feedback option into the early-access version that makes it very easy for users to send
Dries a few lines of feedback, for example by email or a link to GitHub (not decided yet). The
feedback should end up somewhere that is easy to keep an overview of.

### 2026-10-17: Early-access static version hosted outside the company

**Status:** raw

Before the real deployment, put a stripped-down version of the editor online as a static web app
on a platform outside the company, which Dries can host himself at little or no cost. Future users
can then try it early and give feedback. No company data leaves the company: users upload a
workspace file from their own computer, work on it in the browser and download it again when they
are done.
