# Fixtures

Real-world reference material. This is the most valuable context for development: it shows what
jobcards actually contain and what the PDF must look like.

## Wanted

- `template/`: the current PowerPoint jobcard template (`.pptx`) and a PDF export of it
- `jobcards/`: 10–20 real, representative jobcards (PDF and, where possible, the `.pptx`),
  including simple and complex ones and examples of annotated images
- `workpacks/`: one or two complete workpack PDFs
- `keyplans/`: one or two real keyplan sketches (PNG or JPEG), to check the size and the look in the
  Keyplan box (Q13)

## Rules

- **Sanitize before committing**: remove or replace client names, personal names and anything
  confidential. Unsanitized material goes in `fixtures/private/`, which is git-ignored.
- Keep files reasonably small; prefer a few representative examples over everything.
