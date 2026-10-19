import type { Jobcard } from '@jobcard/domain';
import { escapeHtml as e } from './html';
import {
  contextInfo,
  sheetCount,
  sheetDocument,
  sheetLabel,
  titleBlock,
  type SheetContext,
} from './sheet';

/**
 * Jobcard template: renders the jobcard cover page as a printable HTML
 * document (A4 portrait). The HTML is turned into PDF by headless Chromium
 * (see docs/adr/0003). Each activity has its own template (render-activity.ts).
 *
 * Filled in: project name, job number, module, jobcard title, JC number and sheet
 * number ("1 of x") in the title block, and the summary of activity names.
 */
export function renderJobcardHtml(jobcard: Jobcard, context?: SheetContext): string {
  return sheetDocument(jobcard.title, STYLES, coverSheet(jobcard, context));
}

/** Cover page: summary of the activities, plus the empty cover page boxes. */
function coverSheet(jobcard: Jobcard, context?: SheetContext): string {
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
    <div class="box keyplan empty"><span class="label">Keyplan:</span></div>
  </div>
  <div class="box hazards empty"><span class="label">Hazards</span></div>
  <div class="body">
    <div class="box pictures empty"><span class="label">General picture(s)</span></div>
    <div class="box disciplines empty"><span class="label">Disciplines:</span></div>
  </div>
  ${titleBlock(jobcard, {
    ...contextInfo(context),
    sheet: sheetLabel(1, sheetCount(jobcard)),
  })}
</section>`;
}

const STYLES = `
  /* Cover page */
  .cover .top { display: flex; min-height: 73mm; padding: 0; }
  .cover .top-left { width: 50%; display: flex; flex-direction: column; border-right: 0.3mm solid #000; }
  .cover .location { height: 7.5mm; flex: none; border-bottom: 0.3mm solid #000; }
  .cover .work { flex: 1; }
  .cover .keyplan { flex: 1; }
  .cover .hazards { height: 18mm; flex: none; }
  .cover .body { flex: 1; min-height: 0; display: flex; padding: 0; }
  .cover .pictures { flex: 1; }
  .cover .disciplines { width: 44mm; height: 104mm; border-left: 0.3mm solid #000; border-bottom: 0.3mm solid #000; }
`;
