import { z } from 'zod';

/**
 * Version of the stored data format. Bump it on any breaking change to the
 * schemas in this package and add a migration (see docs/adr/0001).
 */
export const SCHEMA_VERSION = 2 as const;

export const Id = z.uuid();
export type Id = z.infer<typeof Id>;

/** Non-empty, trimmed text. */
export const Text = z.string().trim().min(1);
