import { SCHEMA_VERSION, type Id, type UserRef } from './common';
import type { ContentTemplate } from './content-template';
import type { Jobcard } from './jobcard';

// This package runs in the browser and in Node, so it loads neither DOM nor
// Node typings. Declare only the shared global it uses.
declare const crypto: { randomUUID(): string };

export interface CreateJobcardInput {
  workpackId: Id;
  jobNumber: string;
  template: ContentTemplate;
  user: UserRef;
  /** Injected for deterministic tests. */
  now?: () => Date;
  newId?: () => Id;
}

/** Creates a new draft jobcard pre-filled from a content template. */
export function createJobcardFromTemplate(input: CreateJobcardInput): Jobcard {
  const now = (input.now ?? (() => new Date()))().toISOString();
  const newId = input.newId ?? (() => crypto.randomUUID());
  const { template } = input;

  return {
    schemaVersion: SCHEMA_VERSION,
    id: newId(),
    workpackId: input.workpackId,
    jobNumber: input.jobNumber,
    title: template.defaults.title ?? 'Untitled jobcard',
    revision: 'A',
    status: 'draft',
    location: {},
    discipline: template.defaults.discipline,
    scope: template.defaults.scope,
    contentTemplate: { id: template.id, version: template.version },
    steps: template.steps.map((s) => ({
      id: newId(),
      text: s.text,
      details: s.details,
      imageIds: [],
    })),
    images: [],
    audit: { createdAt: now, createdBy: input.user, updatedAt: now, updatedBy: input.user },
  };
}
