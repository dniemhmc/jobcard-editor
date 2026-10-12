import { z } from 'zod';
import { Audit, Id, SCHEMA_VERSION, Text } from './common';

/**
 * A bundle of jobcards, typically all jobcards needed to decommission one
 * module of the platform. Belongs to exactly one project.
 */
export const Workpack = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: Id,
  projectId: Id,
  /** Human-facing workpack number. */
  code: Text,
  title: Text,
  /** Platform module this workpack covers, e.g. "M03 Utilities module". */
  module: z.string().optional(),
  description: z.string().optional(),
  /** Jobcard order within the workpack (and in the workpack PDF). */
  jobcardIds: z.array(Id),
  audit: Audit,
});
export type Workpack = z.infer<typeof Workpack>;
