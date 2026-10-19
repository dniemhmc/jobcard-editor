import { z } from 'zod';
import { Id, SCHEMA_VERSION, Text } from './common';

/**
 * A bundle of jobcards, typically all jobcards needed to decommission one
 * module of the platform.
 */
export const Workpack = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: Id,
  title: Text,
  /**
   * Module of the platform this workpack is for, entered by hand as free text.
   * Printed in the title block of every sheet. Optional: older workpacks have none.
   */
  module: Text.optional(),
  /**
   * Department responsible for this workpack, entered by hand as free text.
   * Printed in the title block of every sheet. Optional.
   */
  department: Text.optional(),
  /**
   * Revision of this workpack (and so of its jobcards), entered by hand as free
   * text. Printed in the title block of every sheet. Optional.
   */
  revision: Text.optional(),
  /**
   * Date of this workpack (and so of its jobcards) as an ISO date, YYYY-MM-DD.
   * Printed in the title block of every sheet. Optional.
   */
  date: z.iso.date().optional(),
  /** Jobcards of this workpack, in display order (and order in the workpack PDF). */
  jobcardIds: z.array(Id),
});
export type Workpack = z.infer<typeof Workpack>;
