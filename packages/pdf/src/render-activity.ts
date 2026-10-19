import type { Activity, Jobcard } from '@jobcard/domain';
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
 * Activity template: renders the page of one activity of a jobcard as a
 * printable HTML document (A4 portrait). The jobcard is needed for the title
 * block.
 *
 * Filled in: every box of the title block except the date (project, job no.,
 * department, module, title, JC no., sheet "2 of x" for the first activity,
 * revision), and the activity name.
 */
export function renderActivityHtml(
  jobcard: Jobcard,
  activity: Activity,
  context?: SheetContext,
): string {
  return sheetDocument(
    `${jobcard.title} - ${activity.name}`,
    STYLES,
    activitySheet(jobcard, activity, context),
  );
}

/** The activity page. */
function activitySheet(jobcard: Jobcard, activity: Activity, context?: SheetContext): string {
  // The cover page is sheet 1, so the first activity is sheet 2.
  const index = jobcard.activities.findIndex((a) => a.id === activity.id);
  const sheet = index < 0 ? undefined : sheetLabel(index + 2, sheetCount(jobcard));

  return `<section class="sheet activity">
  <div class="box discipline-bar empty"><span class="label">Discipline</span></div>
  <div class="box work">
    <span class="label filled">Activity:</span>
    <ul class="activities"><li>${e(activity.name)}</li></ul>
  </div>
  <div class="box steps empty"><span class="label">Detailed activity step(s):</span></div>
  <div class="box details empty">
    <span class="label">Detailed description of execution, hazards and precautions</span>
  </div>
  ${titleBlock(jobcard, { ...contextInfo(context), sheet })}
</section>`;
}

const STYLES = `
  /* Activity page */
  .activity .discipline-bar { height: 7.5mm; flex: none; padding-top: 1.2mm; }
  .activity .work { min-height: 39mm; }
  .activity .steps { height: 27mm; flex: none; }
  .activity .details { flex: 1; min-height: 0; }
`;
