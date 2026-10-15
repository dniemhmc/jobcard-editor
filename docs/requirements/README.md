# Requirements

Ids are stable; reference them in issues, PRs and tests. Detailed user stories live in GitHub
issues; this file is the overview.

Priority: **Must** is being built now. **Later** is a nice to have that comes back in a later
iteration; it has no data model until it is picked up (ADR 0006). Deferred requirements keep
their id.

| Id  | Requirement                                                                                                   | Phase | Priority |
| --- | ------------------------------------------------------------------------------------------------------------- | ----- | -------- |
| R1  | Creating a jobcard is significantly faster and more pleasant than in PowerPoint (measured against a baseline) | all   | Must     |
| R2  | Jobcard data is stored in a structured format that downstream programs can easily consume                     | 1     | Must     |
| R3  | A jobcard can be exported to PDF that resembles the current jobcard template                                  | 1     | Must     |
| R4  | R2S integration: use R2S pictures in jobcards; each links back to its viewpoint in R2S                        | later | Later    |
| R5  | 25 prefilled content templates for common jobs + 1 generic template where the user fills in everything        | later | Later    |
| R6  | Basic image editing: highlight an object/area in an image and label it                                        | later | Later    |
| R7  | Jobcards are organised in workpacks, workpacks in projects                                                    | 1, 2  | Must     |
| R8  | A workpack PDF document can be generated                                                                      | 2     | Must     |

## Non-functional

| Id  | Requirement                                                                             |
| --- | --------------------------------------------------------------------------------------- |
| N1  | Works in a standard company browser, no installation                                    |
| N2  | Corporate single sign-on                                                                |
| N3  | No data loss: autosave, edits never lost on refresh                                     |
| N4  | The design supports the future Control of Work system (statuses, revisions, API access) |
