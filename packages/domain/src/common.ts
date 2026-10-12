import { z } from 'zod';

/**
 * Version of the stored data format. Bump it on any breaking change to the
 * schemas in this package and add a migration (see docs/adr/0001).
 */
export const SCHEMA_VERSION = 1 as const;

export const Id = z.uuid();
export type Id = z.infer<typeof Id>;

export const Timestamp = z.iso.datetime({ offset: true });
export type Timestamp = z.infer<typeof Timestamp>;

/** Identifies a user. Will map to the corporate SSO identity once auth exists. */
export const UserRef = z.string().min(1);
export type UserRef = z.infer<typeof UserRef>;

export const Audit = z.object({
  createdAt: Timestamp,
  createdBy: UserRef,
  updatedAt: Timestamp,
  updatedBy: UserRef,
});
export type Audit = z.infer<typeof Audit>;

/** Non-empty, trimmed text. */
export const Text = z.string().trim().min(1);
