import type { Jobcard } from '@jobcard/domain';
import { describe, expect, it } from 'vitest';
import { renderJobcardHtml } from './render-jobcard';

const jobcard: Jobcard = {
  schemaVersion: 2,
  id: '00000000-0000-4000-8000-000000000003',
  title: 'Remove <grating> & handrail',
  activities: [
    { id: '00000000-0000-4000-8000-000000000004', name: 'First' },
    { id: '00000000-0000-4000-8000-000000000005', name: 'Second <b>' },
  ],
};

describe('renderJobcardHtml', () => {
  const html = renderJobcardHtml(jobcard);

  it('escapes user text', () => {
    expect(html).toContain('Remove &lt;grating&gt; &amp; handrail');
    expect(html).not.toContain('<grating>');
    expect(html).toContain('<li>Second &lt;b&gt;</li>');
  });

  it('renders activities in order', () => {
    expect(html.indexOf('<li>First</li>')).toBeGreaterThan(-1);
    expect(html.indexOf('First')).toBeLessThan(html.indexOf('Second'));
  });
});
