import { describe, expect, it } from 'vitest';
import { paginateSheets, type ActivitySheet } from './paginate-sheets';
import { SAMPLE_SHEET_DATA } from './sample-sheet-data';
import type { JobcardSheetData, MainActivity } from './sheet-data';

function withActivities(activities: MainActivity[]): JobcardSheetData {
  return { ...SAMPLE_SHEET_DATA, activities };
}

const activity = (steps: number, extra: Partial<MainActivity> = {}): MainActivity => ({
  title: 'Activity',
  disciplines: [{ code: 'MECH' }],
  steps: Array.from({ length: steps }, (_, i) => ({ text: `Step ${i + 1}` })),
  hazardsAndPrecautions: [],
  pictures: [],
  ...extra,
});

describe('paginateSheets', () => {
  it('starts with the front sheet and gives each activity its own sheet', () => {
    const sheets = paginateSheets(SAMPLE_SHEET_DATA);
    expect(sheets.map((s) => s.kind)).toEqual(['front', 'activity', 'activity', 'activity']);
    expect(sheets.map((s) => s.number)).toEqual([1, 2, 3, 4]);
    expect(sheets.slice(1).map((s) => (s as ActivitySheet).activityIndex)).toEqual([0, 1, 2]);
  });

  it('continues a long activity on extra sheets, keeping step numbers', () => {
    const sheets = paginateSheets(withActivities([activity(80)])) as ActivitySheet[];
    const detail = sheets.slice(1);
    expect(detail.length).toBeGreaterThan(1);
    expect(detail.map((s) => s.continued)).toEqual(detail.map((_, i) => i > 0));
    const numbers = detail.flatMap((s) => s.steps.map((x) => x.number));
    expect(numbers).toEqual(Array.from({ length: 80 }, (_, i) => i + 1));
  });

  it('puts pictures on the first sheet of an activity only', () => {
    const pics = [{ caption: 'a' }];
    const sheets = paginateSheets(withActivities([activity(80, { pictures: pics })]));
    const detail = sheets.slice(1) as ActivitySheet[];
    expect(detail[0]?.pictures).toEqual(pics);
    expect(detail.slice(1).every((s) => s.pictures.length === 0)).toBe(true);
  });

  it('fits fewer steps on a sheet that has pictures', () => {
    const plain = paginateSheets(withActivities([activity(80)]))[1] as ActivitySheet;
    const withPics = paginateSheets(
      withActivities([activity(80, { pictures: [{ caption: 'a' }] })]),
    )[1] as ActivitySheet;
    expect(withPics.steps.length).toBeLessThan(plain.steps.length);
  });

  it('shows hazards and the General Work Methods note once, on the last sheet', () => {
    const a = activity(80, { hazardsAndPrecautions: ['PPE'], referToGeneralWorkMethods: true });
    const detail = paginateSheets(withActivities([a])).slice(1) as ActivitySheet[];
    expect(detail.filter((s) => s.showHazards)).toHaveLength(1);
    expect(detail.filter((s) => s.showGeneralWorkMethods)).toHaveLength(1);
    expect(detail.at(-1)?.showHazards).toBe(true);
  });

  it('still prints a sheet for an activity without steps', () => {
    const sheets = paginateSheets(withActivities([activity(0)]));
    expect(sheets).toHaveLength(2);
  });
});
