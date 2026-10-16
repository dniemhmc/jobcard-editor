import type { Activity, Jobcard } from '@jobcard/domain';
import { escapeHtml as e } from './html';

/**
 * Renders a jobcard as a printable HTML document (A4 portrait). The HTML is
 * turned into PDF by headless Chromium (see docs/adr/0003).
 *
 * WIREFRAME LAYOUT. The sheets follow the layout of the "JOBCARD General
 * TEMPLATE Rev 11.02.2026": a cover page, then one activity page per
 * activity, each with the title block at the bottom. Only fields that exist
 * in the domain are filled in (jobcard title, activity names). Every other
 * box of the template is drawn empty with its label in grey, so fields can
 * be added one at a time and checked against the template.
 */
export function renderJobcardHtml(jobcard: Jobcard): string {
  const sheets = [coverSheet(jobcard), ...jobcard.activities.map((a) => activitySheet(jobcard, a))];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${e(jobcard.title)}</title>
<style>${STYLES}</style>
</head>
<body>
${sheets.join('\n')}
</body>
</html>`;
}

/** Cover page: summary of the activities, plus the empty cover page boxes. */
function coverSheet(jobcard: Jobcard): string {
  const activities = jobcard.activities.map((a) => `<li>${e(a.name)}</li>`).join('');

  return `<section class="sheet cover">
  <div class="top">
    <div class="top-left">
      <div class="box location empty"><span class="label">Location:</span></div>
      <div class="box work">
        <span class="label filled">Work description / execution:</span>
        <ul class="activities">${activities}</ul>
      </div>
    </div>
    <div class="box keyplan empty"><span class="label">Keyplan:</span></div>
  </div>
  <div class="box hazards empty"><span class="label">Hazards</span></div>
  <div class="body">
    <div class="box pictures empty"><span class="label">General picture(s)</span></div>
    <div class="box disciplines empty"><span class="label">Disciplines:</span></div>
  </div>
  ${titleBlock(jobcard)}
</section>`;
}

/** One activity page per activity. */
function activitySheet(jobcard: Jobcard, activity: Activity): string {
  return `<section class="sheet activity">
  <div class="box discipline-bar empty"><span class="label">Discipline</span></div>
  <div class="box work">
    <span class="label filled">Work description / execution:</span>
    <ul class="activities"><li>${e(activity.name)}</li></ul>
  </div>
  <div class="box steps empty"><span class="label">Detailed activity step(s):</span></div>
  <div class="box details empty">
    <span class="label">Detailed description of execution, hazards and precautions</span>
  </div>
  ${titleBlock(jobcard)}
</section>`;
}

/** The title block repeated at the bottom of every sheet. */
function titleBlock(jobcard: Jobcard): string {
  const cell = (cls: string, label: string, value = '') =>
    `<div class="cell ${cls}${value ? '' : ' empty'}"><span class="cell-label">${label}</span><span class="cell-value">${value}</span></div>`;

  return `<div class="title-block">
    <div class="logo"></div>
    <div class="rows">
      <div class="row r1">${cell('project', 'Project:')}${cell('job-no', 'Job no.:')}${cell('department', 'Department:')}</div>
      <div class="row r2">${cell('module', 'Module:')}${cell('title', 'Title:', e(jobcard.title))}</div>
      <div class="row r3">${cell('date', 'Date:')}${cell('jc-no', 'JC no.:')}${cell('sht', 'Sht.:')}${cell('rev', 'Rev.:')}</div>
    </div>
  </div>`;
}

// Box sizes are taken from the template sheets (frame 190 x 277 mm on A4).
const STYLES = `
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #000; }
  @media screen {
    body { background: #9a9a9a; padding: 8mm 0; }
    .sheet { margin: 0 auto 8mm; box-shadow: 0 1mm 4mm rgba(0, 0, 0, 0.4); }
  }

  .sheet {
    width: 210mm; height: 297mm; padding: 10mm; background: #fff;
    display: flex; flex-direction: column;
    break-after: page; overflow: hidden;
  }
  .sheet:last-child { break-after: auto; }
  .sheet > * { border: 0.3mm solid #000; }
  .sheet > * + * { border-top: none; }

  .box { position: relative; padding: 1.5mm 2.5mm; }
  .label { display: block; font-weight: bold; text-transform: uppercase; font-size: 9pt; }
  .empty .label, .empty .cell-label { color: #9a9a9a; }

  .activities { list-style: none; margin: 1.5mm 0 0; padding: 0; }
  .activities li { position: relative; padding-left: 5mm; margin-bottom: 1mm; overflow-wrap: anywhere; }
  .activities li::before {
    content: ''; position: absolute; left: 0.5mm; top: 0.8mm;
    width: 2.6mm; height: 2.6mm; border: 0.25mm solid #000;
  }

  /* Cover page */
  .cover .top { display: flex; min-height: 73mm; padding: 0; }
  .cover .top-left { width: 50%; display: flex; flex-direction: column; border-right: 0.3mm solid #000; }
  .cover .location { height: 7.5mm; flex: none; }
  .cover .work { flex: 1; }
  .cover .keyplan { flex: 1; }
  .cover .hazards { height: 18mm; flex: none; }
  .cover .body { flex: 1; min-height: 0; display: flex; padding: 0; }
  .cover .pictures { flex: 1; }
  .cover .disciplines { width: 44mm; height: 104mm; border-left: 0.3mm solid #000; border-bottom: 0.3mm solid #000; }

  /* Activity pages */
  .activity .discipline-bar { height: 7.5mm; flex: none; padding-top: 1.2mm; }
  .activity .work { min-height: 39mm; }
  .activity .steps { height: 27mm; flex: none; }
  .activity .details { flex: 1; min-height: 0; }

  /* Title block */
  .title-block { height: 29mm; flex: none; display: flex; }
  .title-block .logo { width: 21mm; border-right: 0.3mm solid #000; }
  .title-block .rows { flex: 1; display: flex; flex-direction: column; }
  .title-block .row { flex: 1; display: grid; }
  .title-block .row + .row { border-top: 0.3mm solid #000; }
  .title-block .r1 { grid-template-columns: 300fr 125fr 268fr; }
  .title-block .r2 { grid-template-columns: 105fr 588fr; }
  .title-block .r3 { grid-template-columns: 160fr 375fr 85fr 73fr; }
  .cell { position: relative; padding: 0.5mm 1mm; display: flex; align-items: center; justify-content: center; }
  .cell + .cell { border-left: 0.3mm solid #000; }
  .cell-label { position: absolute; top: 0.4mm; left: 0.8mm; font-size: 5.5pt; text-transform: uppercase; }
  .cell-value { font-size: 11pt; padding-top: 2mm; text-align: center; overflow-wrap: anywhere; }
`;
