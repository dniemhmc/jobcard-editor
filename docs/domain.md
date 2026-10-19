# Domain

## Context

The company decommissions offshore platforms. **Control of Work (CoW)** is the end-to-end process
of defining, planning, permitting, executing and tracking that work. This project starts with
improving how **jobcards** are created.

## Glossary

| Term                 | Meaning                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Project**          | A decommissioning project, usually one platform/installation. Contains workpacks.                                  |
| **Module**           | A physical part of the platform (e.g. a utilities module) that is decommissioned as a unit.                        |
| **Workpack**         | A bundle of jobcards, usually all jobcards needed to decommission one module. Published as one PDF document.       |
| **Jobcard**          | Instructions for one piece of work offshore: a title and an ordered list of activities.                            |
| **Activity**         | A main activity on a jobcard, in the order it is performed. Stored inside its jobcard (Q12).                       |
| **Content template** | A prefilled set of activities (and defaults) for a common recurring job. There is also one empty generic template. |
| **Annotation**       | Markup on a jobcard image: a highlight of an object/area, and labels naming it.                                    |
| **R2S**              | A tool that provides a street-view-like, point-cloud-backed view of a platform. Images can be taken from it.       |
| **Viewpoint**        | The position/direction in R2S an image was taken from, so we can link back to it.                                  |

Example jobcard: _clear the old lifting points of the platform so they can be used in future
lifts._

## Jobcard content

The domain currently holds only what the editor screens show (ADR 0006):

- Project: name, and its workpacks in order.
- Workpack: title, and its jobcards in order.
- Jobcard: title, and its activities in order.
- Activity: name.

Planned later, as screens and the PDF template need them: job number, revision, status, location,
discipline, detailed steps, images with annotations (ADR 0004), R2S viewpoints and content
templates. The glossary above keeps these terms so the vocabulary stays consistent.

## Current workflow (as-is)

1. Copy a predefined jobcard layout template in PowerPoint.
2. Fill in the metadata and steps; paste photos and mark them up with PowerPoint shapes.
3. Export each jobcard to PDF.
4. Collect the PDFs into a workpack document.

PowerPoint is used because of its flexible image handling. Pain points: slow, repetitive,
data is locked in slides and cannot be used downstream.

## Goals (to-be)

- Creating a jobcard is **significantly faster and more pleasant** than in PowerPoint. Adoption is
  crucial: users must want to switch.
- Jobcard data is stored in a structured, machine-readable form for downstream systems.
- PDF output resembles the current jobcard template; workpack PDFs can be generated.
- Tight R2S integration: use R2S images and link back to the viewpoint in R2S.
