import { z } from 'zod';
import { Id, SCHEMA_VERSION, Text } from './common';

/** A decommissioning project, usually one platform. Contains workpacks. */
export const Project = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: Id,
  name: Text,
  /** Workpacks of this project, in display order. */
  workpackIds: z.array(Id),
});
export type Project = z.infer<typeof Project>;
