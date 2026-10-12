import { z } from 'zod';
import { Text } from './common';

/**
 * Prefilled starting point for a common, recurring job. Templates are data
 * (JSON in packages/content-templates) and are versioned: a jobcard records
 * which template id + version it was created from.
 */
export const ContentTemplate = z.object({
  /** Stable slug, e.g. "lifting-point-clearance". Never rename once used. */
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  version: z.number().int().positive(),
  /** `draft` templates must not be offered to users in production. */
  status: z.enum(['draft', 'approved']),
  name: Text,
  description: z.string(),
  defaults: z.object({
    title: z.string().optional(),
    discipline: z.string().optional(),
    scope: z.string().optional(),
  }),
  steps: z.array(z.object({ text: Text, details: z.string().optional() })),
});
export type ContentTemplate = z.infer<typeof ContentTemplate>;

/** Id of the template that leaves every field for the user to fill in. */
export const GENERIC_TEMPLATE_ID = 'generic';
