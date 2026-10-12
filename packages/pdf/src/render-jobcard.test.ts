import type { Jobcard, Project, Workpack } from '@jobcard/domain';
import { describe, expect, it } from 'vitest';
import { renderJobcardHtml } from './render-jobcard';

const audit = {
  createdAt: '2026-03-01T08:00:00Z',
  createdBy: 'tester',
  updatedAt: '2026-03-02T08:00:00Z',
  updatedBy: 'tester',
};
const project: Project = {
  schemaVersion: 1,
  id: '00000000-0000-4000-8000-000000000001',
  code: 'P001',
  name: 'Example decommissioning',
  installation: 'Platform A',
  audit,
};
const workpack: Workpack = {
  schemaVersion: 1,
  id: '00000000-0000-4000-8000-000000000002',
  projectId: project.id,
  code: 'WP-01',
  title: 'Utilities module',
  jobcardIds: [],
  audit,
};
const jobcard: Jobcard = {
  schemaVersion: 1,
  id: '00000000-0000-4000-8000-000000000003',
  workpackId: workpack.id,
  jobNumber: 'JC-001',
  title: 'Remove <grating> & handrail',
  revision: 'A',
  status: 'draft',
  location: { module: 'M03', deck: 'Cellar deck' },
  steps: [
    { id: '00000000-0000-4000-8000-000000000004', text: 'First', imageIds: [] },
    { id: '00000000-0000-4000-8000-000000000005', text: 'Second', imageIds: [] },
  ],
  images: [],
  audit,
};

describe('renderJobcardHtml', () => {
  const html = renderJobcardHtml(jobcard, { project, workpack });

  it('escapes user text', () => {
    expect(html).toContain('Remove &lt;grating&gt; &amp; handrail');
    expect(html).not.toContain('<grating>');
  });

  it('renders steps in order with numbering', () => {
    expect(html.indexOf('First')).toBeLessThan(html.indexOf('Second'));
    expect(html).toContain('<td class="n">2</td>');
  });

  it('shows metadata', () => {
    expect(html).toContain('JC-001 rev A');
    expect(html).toContain('M03 / Cellar deck');
    expect(html).toContain('2026-03-02');
  });
});
