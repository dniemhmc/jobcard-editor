import { z } from 'zod';
import { Id, SCHEMA_VERSION, Text } from './common';

/** One activity on a jobcard. Stored inside its jobcard. */
export const Activity = z.object({
  id: Id,
  name: Text,
});
export type Activity = z.infer<typeof Activity>;

/** Instructions for one piece of work offshore. */
export const Jobcard = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: Id,
  title: Text,
  /** Activities in the order they are performed (and printed). */
  activities: z.array(Activity),
});
export type Jobcard = z.infer<typeof Jobcard>;
