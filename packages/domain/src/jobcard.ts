import { z } from 'zod';
import { Id, SCHEMA_VERSION, Text } from './common';

/**
 * The predefined disciplines, in the order they are listed and printed. The
 * stored value is the code, so the label and colour below can change without
 * touching stored data.
 */
export const DISCIPLINES = [
  'RIG',
  'MECH',
  'HSE',
  'WLDR',
  'ELEC',
  'SCAF',
  'NDE (RAT)',
  'NDE',
  'SUBSEA',
  'DECOM RIG',
  'RAT',
  'FIELD',
] as const;

export const Discipline = z.enum(DISCIPLINES);
export type Discipline = z.infer<typeof Discipline>;

/** Colours of the discipline bar on the activity sheet (hex, with the text colour on it). */
export const DISCIPLINE_STYLES: Record<Discipline, { background: string; text: string }> = {
  RIG: { background: '#FFFF00', text: '#000000' },
  MECH: { background: '#C55A11', text: '#FFFFFF' },
  HSE: { background: '#7030A0', text: '#FFFFFF' },
  WLDR: { background: '#FF0000', text: '#FFFFFF' },
  ELEC: { background: '#002060', text: '#FFFFFF' },
  SCAF: { background: '#00B050', text: '#FFFFFF' },
  'NDE (RAT)': { background: '#0070C0', text: '#FFFFFF' },
  NDE: { background: '#0070C0', text: '#FFFFFF' },
  SUBSEA: { background: '#00B0F0', text: '#000000' },
  'DECOM RIG': { background: '#FFC000', text: '#000000' },
  RAT: { background: '#808080', text: '#FFFFFF' },
  FIELD: { background: '#FF66FF', text: '#FFFFFF' },
};

/** One activity on a jobcard. Stored inside its jobcard. */
export const Activity = z.object({
  id: Id,
  name: Text,
  /**
   * Disciplines needed for the activity, in the order of `DISCIPLINES`, no
   * duplicates. Printed as the header bar of the activity sheet. Optional:
   * absent means none chosen.
   */
  disciplines: z
    .array(Discipline)
    .refine((list) => new Set(list).size === list.length, 'Disciplines must be unique')
    .optional(),
});
export type Activity = z.infer<typeof Activity>;

/** Instructions for one piece of work offshore. */
export const Jobcard = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: Id,
  title: Text,
  /**
   * JC number (jobcard number), entered by hand as free text. Printed in the
   * title block of every sheet. Optional: older jobcards have none.
   */
  jcNumber: Text.optional(),
  /** Activities in the order they are performed (and printed). */
  activities: z.array(Activity),
});
export type Jobcard = z.infer<typeof Jobcard>;
