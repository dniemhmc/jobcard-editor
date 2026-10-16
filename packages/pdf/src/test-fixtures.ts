import type { Jobcard } from '@jobcard/domain';

export const jobcard: Jobcard = {
  schemaVersion: 2,
  id: '00000000-0000-4000-8000-000000000003',
  title: 'Remove <grating> & handrail',
  activities: [
    { id: '00000000-0000-4000-8000-000000000004', name: 'First' },
    { id: '00000000-0000-4000-8000-000000000005', name: 'Second <b>' },
  ],
};

export const count = (html: string, needle: string) => html.split(needle).length - 1;
