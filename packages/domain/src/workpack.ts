import { z } from 'zod';
import { Id, SCHEMA_VERSION, Text } from './common';

/**
 * The keyplan picture of a workpack: a sketch of the platform with the module
 * highlighted, uploaded as a plain image (no markup is stored). Only the
 * reference is stored here; the image bytes live in the asset store, keyed by
 * `assetId`.
 */
export const Keyplan = z.object({
  assetId: Id,
  mediaType: z.enum(['image/png', 'image/jpeg']),
  /** Name of the uploaded file, for display in the editor. */
  fileName: Text.optional(),
});
export type Keyplan = z.infer<typeof Keyplan>;

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
  /** Keyplan picture printed on the cover page of every jobcard. Optional. */
  keyplan: Keyplan.optional(),
  /** Jobcards of this workpack, in display order (and order in the workpack PDF). */
  jobcardIds: z.array(Id),
});
export type Workpack = z.infer<typeof Workpack>;
