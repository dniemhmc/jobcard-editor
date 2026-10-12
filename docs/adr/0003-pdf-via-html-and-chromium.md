# 0003. Generate PDFs from HTML/CSS with headless Chromium

- Status: Accepted
- Date: 2026-10-12

## Context

The PDF must closely resemble the existing PowerPoint jobcard template and include annotated
images. Workpack PDFs combine many jobcards plus a cover/index.

Options considered: PDF libraries with manual layout (pdfkit, pdf-lib drawing), React-PDF,
Typst/LaTeX, HTML + headless browser.

## Decision

- Render each jobcard to an HTML page with print CSS (`packages/pdf`), then print to PDF with
  headless Chromium (Playwright).
- Annotations are rendered as SVG over the image in the same HTML.
- Workpack PDFs: render cover/index the same way, then merge with `pdf-lib`.
- The editor's live preview uses the same HTML, so preview and PDF match.

## Consequences

- Layout is iterated quickly in HTML/CSS, which AI agents handle well.
- The server needs Chromium (container image size, memory). Acceptable for internal use.
- Visual regression tests (rendered page images compared to approved references) protect the
  layout.
