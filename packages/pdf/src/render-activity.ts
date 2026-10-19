import type { Activity, Jobcard } from '@jobcard/domain';
import { escapeHtml as e } from './html';
import { sheetDocument, titleBlock } from './sheet';

/**
 * Activity template: renders the page of one activity of a jobcard as a
 * printable HTML document (A4 portrait). The jobcard is needed for the title
 * block.
 *
 * Filled in: project name and jobcard title (title block) and the activity
 * name.
 */
export function renderActivityHtml(
  jobcard: Jobcard,
  activity: Activity,
  projectName?: string,
): string {
  return sheetDocument(
    `${jobcard.title} - ${activity.name}`,
    STYLES,
    activitySheet(jobcard, activity, projectName),
  );
}

/** The activity page. */
function activitySheet(jobcard: Jobcard, activity: Activity, projectName?: string): string {
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
  ${titleBlock(jobcard, projectName)}
</section>`;
}

const STYLES = `
  /* Activity page */
  .activity .discipline-bar { height: 7.5mm; flex: none; padding-top: 1.2mm; }
  .activity .work { min-height: 39mm; }
  .activity .steps { height: 27mm; flex: none; }
  .activity .details { flex: 1; min-height: 0; }
`;
