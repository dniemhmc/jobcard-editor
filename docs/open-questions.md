# Open questions

Unresolved questions that affect design. AI agents: do not guess answers to these; flag them.

## Open

| #   | Question                                                                                                 | Affects          | Needed for |
| --- | -------------------------------------------------------------------------------------------------------- | ---------------- | ---------- |
| Q3  | Does R2S have an API? Can we get an image + viewpoint (position, heading, pitch, FOV)? Deep-link format? | R2S integration  | R4 (Later) |
| Q8  | What does a workpack PDF contain besides jobcards (cover, index, revision history)?                      | Workpack PDF     | Phase 2    |
| Q9  | Who owns and approves the 25 content templates?                                                          | Template process | R5 (Later) |

## Answered

Answered by Dries on 2026-10-16 unless noted. "Assumed" means a working assumption to confirm
before go-live.

| #   | Question                                                                         | Answer                                                                                                                                                                                                                                                                                                 | Status   |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Q1  | Where will this be hosted (Azure / AWS / on-prem)?                               | Azure, on the company's Docker container platform. IT provides no database: the app brings its own PostgreSQL (Azure Database for PostgreSQL). The data team's Databricks / Microsoft Fabric platform is a downstream consumer of jobcard data (via the later read API / export), not the app's store. | Answered |
| Q2  | Which SSO / identity provider?                                                   | Microsoft Entra ID (OIDC). Follow-up: IT registers the app and decides which users get access.                                                                                                                                                                                                         | Answered |
| Q4  | Do several people edit the same jobcard at the same time?                        | No live co-editing. Only about 4 people author jobcards company-wide, each on their own projects. Saving checks whether someone else changed the jobcard in the meantime and asks the user to reload instead of overwriting.                                                                           | Answered |
| Q5  | Is any editing done offshore with limited connectivity?                          | No offline support. Offshore editing is a rare exception and is not considered; offshore crews use the PDF. A read-only tablet app for offshore crews is a possible future project.                                                                                                                    | Answered |
| Q6  | Exact list of metadata fields on the current template (and which are mandatory)? | Answered by the approach: fields are taken from the layout template one at a time (roadmap, Phase 1a).                                                                                                                                                                                                 | Answered |
| Q7  | Job number / revision numbering scheme? Generated or entered by user?            | Job no., JC no., department and revision are in, entered by hand as free text: job no. on the project, department and revision on the workpack, JC no. on the jobcard. No numbering scheme is assumed.                                                                                                 | Answered |
| Q10 | Data classification of jobcards and images (confidentiality, retention)?         | Assumed Confidential: access limited to project members, data kept in an EU Azure region. Retention rules to confirm with IT / legal before go-live.                                                                                                                                                   | Assumed  |
| Q11 | Who maintains the system long term?                                              | The decom department owns the app; Dries maintains it for now and the near future; maintenance may be outsourced later. So: managed Azure services only, a mainstream stack, and docs good enough for a third party to take over.                                                                      | Answered |
| Q12 | Is an activity the same as the domain "step", or a grouping of steps?            | An activity is a main activity, the unit of work on a jobcard. Detailed steps are out of scope for now.                                                                                                                                                                                                | Answered |
