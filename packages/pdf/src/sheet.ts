import type { Jobcard } from '@jobcard/domain';
import { escapeHtml as e } from './html';

/**
 * Shared parts of the jobcard and activity templates: the A4 document shell,
 * the title block that is printed at the bottom of every sheet, and the base
 * styles. Box sizes follow the "JOBCARD General TEMPLATE Rev 11.02.2026".
 *
 * WIREFRAME LAYOUT. Only fields that exist in the domain are filled in. Every
 * other box of the template is drawn empty with its label in grey, so fields
 * can be added one at a time and checked against the template.
 */
export function sheetDocument(title: string, styles: string, sheets: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${e(title)}</title>
<style>${BASE_STYLES}${styles}</style>
</head>
<body>
${sheets}
</body>
</html>`;
}

/** Values the title block takes besides the jobcard. A box stays empty without its value. */
export interface TitleBlockInfo {
  /** Name of the project the jobcard belongs to. */
  projectName?: string;
  /** Page number of this sheet, e.g. "2 of 4". */
  sheet?: string;
}

/**
 * Number of sheets a jobcard prints as: the cover page, then one sheet per
 * activity.
 */
export function sheetCount(jobcard: Jobcard): number {
  return 1 + jobcard.activities.length;
}

/** Page number as printed in the Sht. box; `position` starts at 1 (the cover page). */
export function sheetLabel(position: number, total: number): string {
  return `${position} of ${total}`;
}

/** The title block repeated at the bottom of every sheet. */
export function titleBlock(jobcard: Jobcard, info: TitleBlockInfo = {}): string {
  const cell = (cls: string, label: string, value = '') =>
    `<div class="cell ${cls}${value ? '' : ' empty'}"><span class="cell-label">${label}</span><span class="cell-value">${e(value)}</span></div>`;

  return `<div class="title-block">
    <div class="logo"></div>
    <div class="rows">
      <div class="row r1">${cell('project', 'Project:', info.projectName)}${cell('job-no', 'Job no.:')}${cell('department', 'Department:')}</div>
      <div class="row r2">${cell('module', 'Module:')}${cell('title', 'Title:', jobcard.title)}</div>
      <div class="row r3">${cell('date', 'Date:')}${cell('jc-no', 'JC no.:')}${cell('sht', 'Sht.:', info.sheet)}${cell('rev', 'Rev.:')}</div>
    </div>
  </div>`;
}

// Box sizes are taken from the template sheets (frame 190 x 277 mm on A4).
const BASE_STYLES = `
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
    content: ''; position: absolute; left: 1mm; top: 1.4mm;
    width: 1.4mm; height: 1.4mm; border-radius: 50%; background: #000;
  }

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
