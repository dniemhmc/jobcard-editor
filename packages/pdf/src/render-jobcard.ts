import type { Jobcard, Project, Workpack } from '@jobcard/domain';
import { escapeHtml as e } from './html';

export interface JobcardRenderContext {
  project: Project;
  workpack: Workpack;
}

/**
 * Renders a jobcard as a printable HTML page (A4 landscape). The HTML is
 * turned into PDF by headless Chromium (see docs/adr/0003).
 *
 * PLACEHOLDER LAYOUT: this must be replaced by a faithful copy of the current
 * PowerPoint jobcard template once it is added to fixtures/.
 */
export function renderJobcardHtml(jobcard: Jobcard, ctx: JobcardRenderContext): string {
  const location = [jobcard.location.module, jobcard.location.deck, jobcard.location.area]
    .filter(Boolean)
    .join(' / ');

  const steps = jobcard.steps
    .map(
      (s, i) =>
        `<tr><td class="n">${i + 1}</td><td>${e(s.text)}${
          s.details ? `<div class="details">${e(s.details)}</div>` : ''
        }</td></tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${e(jobcard.jobNumber)} – ${e(jobcard.title)}</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; margin: 0; }
  header { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid #000; }
  header div { padding: 2mm; border-right: 1px solid #000; }
  header label { display: block; font-size: 7pt; color: #555; }
  h1 { font-size: 14pt; margin: 4mm 0; }
  table { width: 100%; border-collapse: collapse; }
  td { border: 1px solid #000; padding: 1.5mm; vertical-align: top; }
  td.n { width: 8mm; text-align: center; }
  .details { font-size: 8pt; color: #333; }
</style>
</head>
<body>
<header>
  <div><label>Project</label>${e(ctx.project.code)} ${e(ctx.project.name)}</div>
  <div><label>Workpack</label>${e(ctx.workpack.code)} ${e(ctx.workpack.title)}</div>
  <div><label>Job number</label>${e(jobcard.jobNumber)} rev ${e(jobcard.revision)}</div>
  <div><label>Last modified</label>${e(jobcard.audit.updatedAt.slice(0, 10))}</div>
</header>
<h1>${e(jobcard.title)}</h1>
<p><strong>Location:</strong> ${e(location || jobcard.location.description)}</p>
${jobcard.scope ? `<p><strong>Scope:</strong> ${e(jobcard.scope)}</p>` : ''}
<table><tbody>${steps}</tbody></table>
</body>
</html>`;
}
