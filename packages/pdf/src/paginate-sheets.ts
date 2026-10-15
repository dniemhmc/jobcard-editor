import type { JobcardSheetData, MainActivity, SheetPicture, SheetStep } from './sheet-data';

export interface FrontSheet {
  kind: 'front';
  number: number;
}

export interface ActivitySheet {
  kind: 'activity';
  number: number;
  /** 0-based index into `JobcardSheetData.activities`. */
  activityIndex: number;
  /** True on the second and later sheets of the same activity. */
  continued: boolean;
  /** Steps on this sheet, with their number within the activity (1-based). */
  steps: { number: number; step: SheetStep }[];
  pictures: SheetPicture[];
  showHazards: boolean;
  showGeneralWorkMethods: boolean;
}

export type Sheet = FrontSheet | ActivitySheet;

/**
 * Room on a detailed sheet, in body text lines. Derived from the CSS in
 * render-jobcard-sheets.ts (A4 portrait, 9 pt text); the estimate errs on the
 * side of starting a new sheet early, since overflowing text is clipped.
 */
export const LAYOUT = {
  linesPerSheet: 46,
  picturesLines: 17,
  headingLines: 1.5,
  stepCharsPerLine: 100,
  detailCharsPerLine: 110,
  hazardCharsPerLine: 100,
} as const;

function wrapLines(text: string, perLine: number): number {
  return text.split('\n').reduce((n, para) => n + Math.max(1, Math.ceil(para.length / perLine)), 0);
}

export function stepLines(step: SheetStep): number {
  const details = step.details ? wrapLines(step.details, LAYOUT.detailCharsPerLine) : 0;
  return wrapLines(step.text, LAYOUT.stepCharsPerLine) + details + 0.4;
}

export function hazardsLines(activity: MainActivity): number {
  if (activity.hazardsAndPrecautions.length === 0) return 0;
  const items = activity.hazardsAndPrecautions.reduce(
    (n, h) => n + wrapLines(h, LAYOUT.hazardCharsPerLine),
    0,
  );
  return LAYOUT.headingLines + items;
}

const GWM_LINES = 2;

function paginateActivity(
  activity: MainActivity,
  activityIndex: number,
): Omit<ActivitySheet, 'number'>[] {
  const sheets: Omit<ActivitySheet, 'number'>[] = [];
  const newSheet = () => {
    const first = sheets.length === 0;
    const pictures = first ? activity.pictures : [];
    const sheet = {
      kind: 'activity' as const,
      activityIndex,
      continued: !first,
      steps: [] as ActivitySheet['steps'],
      pictures,
      showHazards: false,
      showGeneralWorkMethods: false,
    };
    sheets.push(sheet);
    return {
      sheet,
      left:
        LAYOUT.linesPerSheet - LAYOUT.headingLines - (pictures.length ? LAYOUT.picturesLines : 0),
    };
  };

  let cur = newSheet();
  activity.steps.forEach((step, i) => {
    const need = stepLines(step);
    if (need > cur.left && cur.sheet.steps.length > 0) cur = newSheet();
    cur.sheet.steps.push({ number: i + 1, step });
    cur.left -= need;
  });

  const hz = hazardsLines(activity);
  if (hz > 0) {
    if (hz > cur.left && (cur.sheet.steps.length > 0 || cur.sheet.pictures.length > 0)) {
      cur = newSheet();
    }
    cur.sheet.showHazards = true;
    cur.left -= hz;
  }
  if (activity.referToGeneralWorkMethods) {
    if (GWM_LINES > cur.left) cur = newSheet();
    cur.sheet.showGeneralWorkMethods = true;
  }
  return sheets;
}

/** Splits a jobcard into printed sheets: the front sheet, then each activity's sheets. */
export function paginateSheets(data: JobcardSheetData): Sheet[] {
  const unnumbered: (Omit<FrontSheet, 'number'> | Omit<ActivitySheet, 'number'>)[] = [
    { kind: 'front' },
    ...data.activities.flatMap((a, i) => paginateActivity(a, i)),
  ];
  return unnumbered.map((s, i) => ({ ...s, number: i + 1 }));
}
