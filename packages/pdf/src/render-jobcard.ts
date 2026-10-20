import { DISCIPLINE_STYLES, jobcardDisciplines, type Jobcard } from '@jobcard/domain';
import { escapeHtml as e } from './html';
import {
  contextInfo,
  sheetCount,
  sheetDocument,
  sheetLabel,
  titleBlock,
  safeImageSrc,
  type SheetContext,
} from './sheet';

/**
 * Jobcard template: renders the jobcard cover page as a printable HTML
 * document (A4 portrait). The HTML is turned into PDF by headless Chromium
 * (see docs/adr/0003). Each activity has its own template (render-activity.ts).
 *
 * Filled in: every box of the title block, the summary of activity names, the
 * keyplan picture and the disciplines used by the activities (one coloured bar
 * each; the box is as tall as its bars).
 */
export function renderJobcardHtml(jobcard: Jobcard, context?: SheetContext): string {
  return sheetDocument(jobcard.title, STYLES, coverSheet(jobcard, context));
}

/** Cover page: summary of the activities, plus the empty cover page boxes. */
function coverSheet(jobcard: Jobcard, context?: SheetContext): string {
  const keyplanSrc = safeImageSrc(context?.keyplanSrc);
  const activities = jobcard.activities.map((a) => `<li>${e(a.name)}</li>`).join('');

  return `<section class="sheet cover">
  <div class="top">
    <div class="top-left">
      <div class="box location empty"><span class="label">Location:</span></div>
      <div class="box work">
        <span class="label filled">Activities:</span>
        <ul class="activities">${activities}</ul>
      </div>
    </div>
    ${
      keyplanSrc
        ? `<div class="box keyplan"><span class="label filled">Keyplan:</span><img class="keyplan-image" src="${e(keyplanSrc)}" alt="Keyplan"></div>`
        : '<div class="box keyplan empty"><span class="label">Keyplan:</span></div>'
    }
  </div>
  <div class="box hazards empty"><span class="label">Hazards</span></div>
  <div class="body">
    <div class="box pictures empty"><span class="label">General picture(s)</span></div>
    ${disciplineLegend(jobcard)}
  </div>
  ${titleBlock(jobcard, {
    ...contextInfo(context),
    sheet: sheetLabel(1, sheetCount(jobcard)),
  })}
</section>`;
}

/** The disciplines box: the used disciplines as stacked bars, or an empty box. */
function disciplineLegend(jobcard: Jobcard): string {
  const disciplines = jobcardDisciplines(jobcard);
  if (disciplines.length === 0) {
    return '<div class="box disciplines empty"><span class="label">Disciplines:</span></div>';
  }
  const bars = disciplines.map((d) => {
    const { background, text } = DISCIPLINE_STYLES[d];
    return `<div class="discipline-bar" style="background:${background};color:${text}">${e(d)}</div>`;
  });
  return `<div class="box disciplines"><span class="label filled">Disciplines:</span>${bars.join('')}</div>`;
}

const STYLES = `
  /* Cover page */
  .cover .top { display: flex; min-height: 73mm; padding: 0; }
  .cover .top-left { width: 50%; display: flex; flex-direction: column; border-right: 0.3mm solid #000; }
  .cover .location { height: 7.5mm; flex: none; border-bottom: 0.3mm solid #000; }
  .cover .work { flex: 1; }
  .cover .keyplan { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .cover .keyplan-image { flex: 1; min-height: 0; width: 100%; object-fit: contain; }
  .cover .hazards { height: 18mm; flex: none; }
  .cover .body { flex: 1; min-height: 0; display: flex; padding: 0; }
  .cover .pictures { flex: 1; }
  .cover .disciplines {
    width: 44mm; flex: none; align-self: flex-start; padding: 1.5mm 2mm 2mm;
    border-left: 0.3mm solid #000; border-bottom: 0.3mm solid #000;
  }
  .cover .disciplines .label { padding: 0 0.5mm; }
  .cover .disciplines .discipline-bar {
    height: 7.5mm; box-sizing: border-box; padding: 2.2mm 2.5mm 0; margin-top: 2mm;
    font-weight: bold; text-transform: uppercase; font-size: 9pt;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
`;
