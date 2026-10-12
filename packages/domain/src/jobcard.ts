import { z } from 'zod';
import { Audit, Id, SCHEMA_VERSION, Text } from './common';
import { JobcardImage } from './image';

/**
 * Lifecycle status. Only `draft` is used by the first editor release; the
 * other values are reserved for the Control of Work review/approval flow.
 */
export const JobcardStatus = z.enum(['draft', 'in_review', 'approved', 'superseded']);
export type JobcardStatus = z.infer<typeof JobcardStatus>;

/** Where on the platform the work takes place. */
export const WorkLocation = z.object({
  module: z.string().optional(),
  deck: z.string().optional(),
  area: z.string().optional(),
  description: z.string().optional(),
});
export type WorkLocation = z.infer<typeof WorkLocation>;

/** One action to perform offshore. */
export const Step = z.object({
  id: Id,
  text: Text,
  /** Extra detail, cautions or notes for this step. */
  details: z.string().optional(),
  /** Images on this jobcard that illustrate this step. */
  imageIds: z.array(Id).default([]),
});
export type Step = z.infer<typeof Step>;

export const Jobcard = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: Id,
  workpackId: Id,
  /** Human-facing job number. */
  jobNumber: Text,
  title: Text,
  revision: Text,
  status: JobcardStatus,
  location: WorkLocation,
  discipline: z.string().optional(),
  /** Short description of the scope / purpose of the job. */
  scope: z.string().optional(),
  /** Content template this jobcard was created from, if any. */
  contentTemplate: z.object({ id: Text, version: z.number().int().positive() }).optional(),
  /** Ordered list of actions to perform. */
  steps: z.array(Step),
  images: z.array(JobcardImage),
  audit: Audit,
});
export type Jobcard = z.infer<typeof Jobcard>;
