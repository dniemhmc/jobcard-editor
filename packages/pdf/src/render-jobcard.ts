import type { Jobcard } from '@jobcard/domain';
import { escapeHtml as e } from './html';

/**
 * Renders a jobcard as a printable HTML page (A4). The HTML is turned into
 * PDF by headless Chromium (see docs/adr/0003).
 *
 * MINIMAL LAYOUT: title and activity names only. The jobcard template is
 * built up from here step by step.
 */
export function renderJobcardHtml(jobcard: Jobcard): string {
  const activities = jobcard.activities.map((a) => `<li>${e(a.name)}</li>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${e(jobcard.title)}</title>
<style>
  @page { size: A4; margin: 10mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; margin: 0; }
  h1 { font-size: 14pt; margin: 0 0 4mm; }
  h2 { font-size: 11pt; margin: 0 0 2mm; }
</style>
</head>
<body>
<h1>${e(jobcard.title)}</h1>
<h2>Activities</h2>
<ol>${activities}</ol>
</body>
</html>`;
}
