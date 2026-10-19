import { z } from 'zod';
import { Id, SCHEMA_VERSION, Text } from './common';

/** A decommissioning project, usually one platform. Contains workpacks. */
export const Project = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: Id,
  name: Text,
  /**
   * Job number (the supplier order number), entered by hand as free text. Printed
   * in the title block of every sheet. Optional: older stored projects have none.
   */
  jobNumber: Text.optional(),
  /** Workpacks of this project, in display order. */
  workpackIds: z.array(Id),
});
export type Project = z.infer<typeof Project>;
