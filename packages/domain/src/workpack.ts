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
  /** Jobcards of this workpack, in display order (and order in the workpack PDF). */
  jobcardIds: z.array(Id),
});
export type Workpack = z.infer<typeof Workpack>;
