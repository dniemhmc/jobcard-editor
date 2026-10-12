import { z } from 'zod';
import { Audit, Id, SCHEMA_VERSION, Text } from './common';

/** A decommissioning project, usually one platform. Contains workpacks. */
export const Project = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: Id,
  /** Human-facing project number, e.g. "P1234". */
  code: Text,
  name: Text,
  /** Platform / installation being decommissioned. */
  installation: Text,
  client: z.string().optional(),
  description: z.string().optional(),
  audit: Audit,
});
export type Project = z.infer<typeof Project>;
