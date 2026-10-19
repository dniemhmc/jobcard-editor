import { describe, expect, it } from 'vitest';
import { renderJobcardHtml } from './render-jobcard';
import { count, jobcard } from './test-fixtures';

describe('renderJobcardHtml', () => {
  const html = renderJobcardHtml(jobcard);

  it('escapes user text', () => {
    expect(html).toContain('Remove &lt;grating&gt; &amp; handrail');
    expect(html).not.toContain('<grating>');
    expect(html).toContain('<li>Second &lt;b&gt;</li>');
  });

  it('renders only the cover page', () => {
    expect(count(html, '<section class="sheet')).toBe(1);
    expect(count(html, '<section class="sheet cover">')).toBe(1);
  });

  it('lists all activities in order under Activities', () => {
    expect(html).toContain('Activities:</span>');
    expect(html).toContain('<li>First</li>');
    expect(html.indexOf('First')).toBeLessThan(html.indexOf('Second'));
  });

  it('shows the jobcard title in the title block', () => {
    expect(count(html, 'class="title-block"')).toBe(1);
    expect(html).toContain('Remove &lt;grating&gt; &amp; handrail</span>');
  });

  it('shows the project name in the title block, escaped', () => {
    const withProject = renderJobcardHtml(jobcard, {
      name: 'Platform <A> & B',
      jobNumber: 'PO <1> & 2',
    });
    expect(withProject).toContain('Platform &lt;A&gt; &amp; B</span>');
    expect(withProject).toContain('PO &lt;1&gt; &amp; 2</span>');
    expect(withProject).not.toContain('<A>');
    expect(withProject).not.toContain('<1>');
    expect(withProject).not.toContain('cell project empty');
    expect(withProject).not.toContain('cell job-no empty');
  });

  it('leaves the project and job number boxes empty without a project', () => {
    expect(html).toContain('cell project empty');
    expect(html).toContain('cell job-no empty');
  });

  it('leaves the job number box empty when the project has none', () => {
    expect(renderJobcardHtml(jobcard, { name: 'Platform A' })).toContain('cell job-no empty');
  });

  it('numbers the cover page as sheet 1 of all sheets', () => {
    expect(html).toContain('>1 of 3</span>');
  });

  it('renders a cover page without activities', () => {
    const empty = renderJobcardHtml({ ...jobcard, activities: [] });
    expect(count(empty, '<section class="sheet cover">')).toBe(1);
    expect(empty).not.toContain('<li>');
    expect(empty).toContain('>1 of 1</span>');
  });
});
