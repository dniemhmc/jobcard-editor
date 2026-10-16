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

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe('renderJobcardHtml', () => {
  const html = renderJobcardHtml(jobcard);

  it('escapes user text', () => {
    expect(html).toContain('Remove &lt;grating&gt; &amp; handrail');
    expect(html).not.toContain('<grating>');
    expect(html).toContain('<li>Second &lt;b&gt;</li>');
  });

  it('renders a cover page plus one activity page per activity', () => {
    expect(count(html, '<section class="sheet cover">')).toBe(1);
    expect(count(html, '<section class="sheet activity">')).toBe(2);
  });

  it('lists all activities in order on the cover page', () => {
    const cover = html.slice(html.indexOf('sheet cover'), html.indexOf('sheet activity'));
    expect(cover.indexOf('<li>First</li>')).toBeGreaterThan(-1);
    expect(cover.indexOf('First')).toBeLessThan(cover.indexOf('Second'));
  });

  it('puts one activity on each activity page, in order', () => {
    const [, first, second] = html.split('<section class="sheet activity">');
    expect(first).toContain('<li>First</li>');
    expect(first).not.toContain('Second');
    expect(second).toContain('<li>Second &lt;b&gt;</li>');
  });

  it('repeats the title block with the jobcard title on every sheet', () => {
    expect(count(html, 'class="title-block"')).toBe(3);
    expect(count(html, 'Remove &lt;grating&gt; &amp; handrail</span>')).toBe(3);
  });

  it('renders only the cover page when there are no activities', () => {
    const empty = renderJobcardHtml({ ...jobcard, activities: [] });
    expect(count(empty, '<section class="sheet')).toBe(1);
  });
});
