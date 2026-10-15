import { escapeHtml as e } from './html';
import { paginateSheets, type ActivitySheet, type Sheet } from './paginate-sheets';
import {
  DISCIPLINES,
  HAZARDS,
  disciplineLabel,
  type DisciplineRef,
  type JobcardSheetData,
  type SheetPicture,
} from './sheet-data';

/**
 * Print CSS for the jobcard sheets. Every sheet is one A4 portrait page with a
 * fixed-height body, so the browser preview and the Chromium PDF break pages in
 * the same places. On screen the sheets are drawn as paper on a grey desk.
 */
export const SHEET_CSS = `
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font: 9pt/1.4 Arial, Helvetica, sans-serif; color: #000; background: #fff;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.sheet { width: 210mm; height: 297mm; padding: 8mm; display: flex; flex-direction: column;
  gap: 2.5mm; background: #fff; overflow: hidden; break-after: page; page-break-after: always; }
.sheet:last-child { break-after: auto; page-break-after: auto; }
@media screen {
  body { background: #9aa3a8; padding: 8mm 0; }
  .sheet { margin: 0 auto 8mm; box-shadow: 0 1mm 4mm rgba(0, 0, 0, 0.35); }
}
.body { flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: 2.5mm; }
.box { border: 0.3mm solid #000; padding: 1.8mm 2.2mm; }
.h { font-weight: 700; text-transform: uppercase; font-size: 8.5pt; }
.h small { font-weight: 400; text-transform: none; font-size: 8pt; }
.muted { color: #555; }

/* Title block, on every sheet */
.tb { display: grid; grid-template-columns: repeat(6, 1fr); border: 0.4mm solid #000; }
.tb > div { border-right: 0.3mm solid #000; border-bottom: 0.3mm solid #000; padding: 0.8mm 1.5mm;
  min-width: 0; overflow-wrap: anywhere; }
.tb > div.r { border-right: 0; }
.tb > div.b { border-bottom: 0; }
.tb label { display: block; font-size: 6.5pt; font-weight: 700; }
.tb .v { font-size: 8.5pt; }
.tb .project { grid-column: span 3; }
.tb .title { grid-column: span 2; font-weight: 700; }

/* Front sheet */
.front-top { display: grid; grid-template-columns: 1fr 1.3fr; gap: 2.5mm; }
.keyplan { position: relative; height: 62mm; margin-top: 1.5mm; }
.north { position: absolute; top: 1.5mm; right: 1.5mm; width: 12mm; text-align: center;
  font-size: 6.5pt; font-weight: 700; background: rgba(255, 255, 255, 0.85); }
.north svg { display: block; margin: 0 auto; width: 7mm; height: 7mm; }
ol.summary { margin: 1.2mm 0 0; padding-left: 6mm; }
ol.summary li { margin-bottom: 0.6mm; }
.hazards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2mm 3mm; margin-top: 1.5mm; }
.hz { display: flex; align-items: center; gap: 1.5mm; }
.cb { flex: none; width: 3.6mm; height: 3.6mm; border: 0.35mm solid #000; text-align: center;
  font: 700 8pt/3.1mm Arial, Helvetica, sans-serif; }
.disc-row { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5mm; }
.chip { padding: 0.6mm 2mm; border: 0.3mm solid #000; font-weight: 700; font-size: 8pt; }
.pictures-box { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.pics { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm;
  margin-top: 1.5mm; align-content: start; }

/* Pictures */
figure { margin: 0; display: flex; flex-direction: column; gap: 0.8mm; min-height: 0; }
.img { position: relative; height: 60mm; border: 0.3mm solid #000; overflow: hidden; background: #f2f2f2; }
.img img { width: 100%; height: 100%; object-fit: contain; display: block; }
.img.ph { background: repeating-linear-gradient(45deg, #eee 0 2mm, #f7f7f7 2mm 4mm);
  display: flex; align-items: center; justify-content: center; color: #777; font-size: 8pt; }
figcaption { font-size: 7.5pt; }

/* Detailed (activity) sheets */
.bar { display: flex; height: 9mm; border: 0.4mm solid #000; }
.bar > div { flex: 1; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12pt; letter-spacing: 0.04em; }
.bar > div + div { border-left: 0.4mm solid #000; }
.main-step { font-size: 10.5pt; font-weight: 700; margin-top: 0.8mm; }
table.steps { width: 100%; border-collapse: collapse; margin-top: 1.2mm; }
.steps td { border: 0.25mm solid #000; padding: 1mm 1.5mm; vertical-align: top; }
.steps td.n { width: 10mm; text-align: center; font-weight: 700; }
.steps .details { font-size: 8pt; color: #333; margin-top: 0.5mm; white-space: pre-wrap; }
.act-pics { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm; }
.act-pics .img { height: 62mm; }
ul.hzp { margin: 1mm 0 0; padding-left: 5mm; }
.gwm { border: 0.35mm dashed #000; padding: 1.5mm 2.2mm; font-style: italic; }
`;

function picture(p: SheetPicture, label: string): string {
  const img = p.src
    ? `<div class="img"><img src="${e(p.src)}" alt="${e(p.caption ?? label)}"></div>`
    : `<div class="img ph">${e(label)}</div>`;
  return `<figure>${img}${p.caption ? `<figcaption>${e(p.caption)}</figcaption>` : ''}</figure>`;
}

function chip(d: DisciplineRef): string {
  const c = DISCIPLINES[d.code];
  return `<span class="chip" style="background:${c.color};color:${c.ink}">${e(disciplineLabel(d))}</span>`;
}

function titleBlock(data: JobcardSheetData, sheet: Sheet, total: number): string {
  const t = data.titleBlock;
  const cell = (cls: string, label: string, value: string) =>
    `<div class="${cls}"><label>${label}</label><div class="v">${e(value)}</div></div>`;
  return `<footer class="tb">
${cell('project', 'PROJECT:', t.project)}${cell('', 'JOB NO.:', t.jobNo)}${cell('', 'DEPARTMENT:', t.department)}${cell('r', 'MODULE:', t.module)}
${cell('title b', 'TITLE:', t.title)}${cell('b', 'DATE:', t.date)}${cell('b', 'JC NO.:', t.jcNo)}${cell('b', 'SHT.:', `${sheet.number} of ${total}`)}${cell('r b', 'REV.:', t.revision)}
</footer>`;
}

function northArrow(deg: number): string {
  return `<div class="north"><svg viewBox="-10 -10 20 20" style="transform:rotate(${Number(deg) || 0}deg)" aria-hidden="true"><path d="M0 -9 L5 7 L0 3 L-5 7 Z" fill="#000"/></svg>Platform north</div>`;
}

function frontSheet(data: JobcardSheetData): string {
  const kp = data.keyplan;
  const keyplan = kp
    ? `<div class="keyplan">${picture(kp, 'Keyplan: isometric view with work location')}${
        kp.northDeg !== undefined ? northArrow(kp.northDeg) : ''
      }</div>`
    : `<div class="keyplan"><div class="img ph" style="height:100%">No keyplan</div></div>`;

  const summary = data.activities.length
    ? `<ol class="summary">${data.activities.map((a) => `<li>${e(a.title)}</li>`).join('')}</ol>`
    : `<p class="muted">No main activities.</p>`;

  const hazards = HAZARDS.map((h) => {
    const on = data.hazards[h.key] === true;
    return `<div class="hz"><span class="cb">${on ? '✕' : ''}</span>${e(h.label)}</div>`;
  }).join('');

  const disciplines = data.disciplines.length
    ? data.disciplines.map(chip).join('')
    : '<span class="muted">None listed</span>';

  const pics = data.generalPictures.length
    ? `<div class="pics">${data.generalPictures.map((p, i) => picture(p, `Picture ${i + 1}`)).join('')}</div>`
    : '';

  return `<div class="body">
<div class="front-top">
  <div class="box"><div class="h">Location:</div><div class="main-step">${e(data.location)}</div></div>
  <div class="box"><div class="h">Keyplan:</div>${keyplan}</div>
</div>
<div class="box"><div class="h">Work description / execution: <small>summary of all main activity steps in this job card</small></div>${summary}</div>
<div class="box"><div class="hazards">${hazards}</div></div>
<div class="box disc-row"><span class="h">Disciplines:</span>${disciplines}</div>
<div class="box pictures-box"><div class="h">General picture(s) <small>work locations, pipe characteristics</small></div>${pics}</div>
</div>`;
}

function activitySheet(data: JobcardSheetData, sheet: ActivitySheet): string {
  const a = data.activities[sheet.activityIndex];
  if (!a) throw new Error(`No activity ${sheet.activityIndex}`);
  const n = sheet.activityIndex + 1;

  const bar = a.disciplines.length
    ? a.disciplines
        .map((d) => {
          const c = DISCIPLINES[d.code];
          return `<div style="background:${c.color};color:${c.ink}">${e(disciplineLabel(d))}</div>`;
        })
        .join('')
    : '<div class="muted">No discipline</div>';

  const steps = sheet.steps.length
    ? `<table class="steps"><tbody>${sheet.steps
        .map(
          ({ number, step }) =>
            `<tr><td class="n">${n}.${number}</td><td>${e(step.text)}${
              step.details ? `<div class="details">${e(step.details)}</div>` : ''
            }</td></tr>`,
        )
        .join('')}</tbody></table>`
    : '';

  const pics = sheet.pictures.length
    ? `<div class="act-pics">${sheet.pictures
        .slice(0, 2)
        .map((p, i) => picture(p, `Picture ${n}.${i + 1}`))
        .join('')}</div>`
    : '';

  const hazards = sheet.showHazards
    ? `<div class="box"><div class="h">Hazards and precautions <small>HAZMAT identification, PPE, hard barriers</small></div><ul class="hzp">${a.hazardsAndPrecautions
        .map((h) => `<li>${e(h)}</li>`)
        .join('')}</ul></div>`
    : '';

  const gwm = sheet.showGeneralWorkMethods
    ? `<div class="gwm">For non-structural removal, follow the General Work Methods.</div>`
    : '';

  return `<div class="bar">${bar}</div>
<div class="box"><div class="h">Work description / execution: <small>(this sheet)</small></div>
<div class="main-step">Main activity step ${n}: ${e(a.title)}${sheet.continued ? ' <span class="muted">(continued)</span>' : ''}</div></div>
<div class="body">
${pics}
${
  steps
    ? `<div class="box"><div class="h">Detailed activity step(s): <small>(this sheet)</small></div>${steps}</div>`
    : ''
}
${hazards}
${gwm}
</div>`;
}

/**
 * Renders a jobcard as print-ready HTML in the layout of the General jobcard
 * template: A4 portrait sheets, front sheet first, then the detailed sheets.
 * Chromium prints it to PDF (ADR 0003); the editor preview shows the same HTML.
 */
export function renderJobcardSheetsHtml(data: JobcardSheetData): string {
  const sheets = paginateSheets(data);
  const total = sheets.length;
  const body = sheets
    .map(
      (s) =>
        `<section class="sheet ${s.kind}" data-sheet="${s.number}">${
          s.kind === 'front' ? frontSheet(data) : activitySheet(data, s)
        }${titleBlock(data, s, total)}</section>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${e(data.titleBlock.jcNo)} – ${e(data.titleBlock.title)}</title>
<style>${SHEET_CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
}
