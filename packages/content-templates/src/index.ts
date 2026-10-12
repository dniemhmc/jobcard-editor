import { ContentTemplate, GENERIC_TEMPLATE_ID } from '@jobcard/domain';
import exampleLiftingPointClearance from '../templates/example-lifting-point-clearance.json';
import generic from '../templates/generic.json';

/**
 * Registry of all content templates. To add one: create a JSON file in
 * ../templates (file name = template id) and add it to this list.
 */
const RAW_TEMPLATES: unknown[] = [generic, exampleLiftingPointClearance];

export const contentTemplates: readonly ContentTemplate[] = RAW_TEMPLATES.map((t) =>
  ContentTemplate.parse(t),
);

export function getContentTemplate(id: string): ContentTemplate | undefined {
  return contentTemplates.find((t) => t.id === id);
}

export function getGenericTemplate(): ContentTemplate {
  const template = getContentTemplate(GENERIC_TEMPLATE_ID);
  if (!template) throw new Error('Generic content template is missing');
  return template;
}

/** Templates that may be offered to users (drafts hidden unless requested). */
export function listContentTemplates(opts: { includeDrafts?: boolean } = {}) {
  return contentTemplates.filter((t) => opts.includeDrafts || t.status === 'approved');
}
