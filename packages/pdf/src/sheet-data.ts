/**
 * What the printed jobcard shows, laid out like the General jobcard template
 * (Rev 11.02.2026): a front sheet plus one detailed sheet per main activity,
 * with the same title block on every sheet.
 *
 * This is a render model, derived from the stored jobcard; it is not stored.
 * Several of these fields (main activities, disciplines, hazard flags,
 * department, keyplan, JC no.) are not in the domain schema yet. Until they
 * are, `jobcardToSheetData` leaves them empty.
 */

/** Hazard / work-type checkboxes on the front sheet, in template order. */
export const HAZARDS = [
  { key: 'hotWork', label: 'Hot work' },
  { key: 'liftingRigging', label: 'Lifting and rigging' },
  { key: 'workAtHeight', label: 'Work at height' },
  { key: 'workOverWater', label: 'Work over water' },
  { key: 'electricalWork', label: 'Electrical work' },
  { key: 'hazmat', label: 'HAZMAT' },
  { key: 'h2sLel', label: 'H2S / LEL' },
  { key: 'norm', label: 'NORM' },
] as const;
export type HazardKey = (typeof HAZARDS)[number]['key'];

/**
 * Discipline codes and their colours, in template legend order.
 *
 * PROVISIONAL colours: only HSE (yellow) was read from the template file; the
 * rest are placeholders until checked against the template PDF.
 */
export const DISCIPLINES = {
  RIG: { label: 'RIG', color: '#2f6fd0', ink: '#ffffff' },
  WLDR: { label: 'WLDR', color: '#e07b1a', ink: '#ffffff' },
  SCAF: { label: 'SCAF', color: '#8a5a2b', ink: '#ffffff' },
  HSE: { label: 'HSE', color: '#ffff00', ink: '#000000' },
  RAT: { label: 'RAT', color: '#7b3fa0', ink: '#ffffff' },
  NDE_RAT: { label: 'NDE (RAT)', color: '#c39bd9', ink: '#000000' },
  NDE: { label: 'NDE', color: '#1a9a8c', ink: '#ffffff' },
  ELEC: { label: 'ELEC', color: '#d02f2f', ink: '#ffffff' },
  MECH: { label: 'MECH', color: '#3f9a3a', ink: '#ffffff' },
  SUBSEA: { label: 'SUBSEA', color: '#1d3f73', ink: '#ffffff' },
  SUBCON: { label: 'SUBCON', color: '#8c8c8c', ink: '#ffffff' },
  FIELD: { label: 'FIELD', color: '#a8d08d', ink: '#000000' },
} as const;
export type DisciplineCode = keyof typeof DISCIPLINES;

export interface DisciplineRef {
  code: DisciplineCode;
  /** Only for SUBCON: the subcontracted scope, shown as "SUBCON – [scope]". */
  scope?: string;
}

export interface SheetPicture {
  caption?: string;
  /** Image URL (data: or same-origin). Without it a marked placeholder is drawn. */
  src?: string;
}

export interface SheetStep {
  text: string;
  details?: string;
}

export interface MainActivity {
  /** Generic activity name, as in the front sheet summary. */
  title: string;
  /** One preferred, two at most (template rule). */
  disciplines: DisciplineRef[];
  steps: SheetStep[];
  /** HAZMAT identification, PPE, hard barriers. */
  hazardsAndPrecautions: string[];
  pictures: SheetPicture[];
  /** Adds the note referring to the General Work Methods. */
  referToGeneralWorkMethods?: boolean;
}

export interface TitleBlock {
  project: string;
  jobNo: string;
  department: string;
  module: string;
  title: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  jcNo: string;
  revision: string;
}

export interface JobcardSheetData {
  titleBlock: TitleBlock;
  location: string;
  keyplan?: SheetPicture & { /** Platform north, degrees clockwise from up. */ northDeg?: number };
  hazards: Partial<Record<HazardKey, boolean>>;
  /** All disciplines needed for the whole jobcard. */
  disciplines: DisciplineRef[];
  generalPictures: SheetPicture[];
  activities: MainActivity[];
}

export function disciplineLabel(d: DisciplineRef): string {
  const base = DISCIPLINES[d.code].label;
  return d.code === 'SUBCON' && d.scope ? `${base} – ${d.scope}` : base;
}
