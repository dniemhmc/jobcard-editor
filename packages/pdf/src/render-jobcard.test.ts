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
    const withProject = renderJobcardHtml(jobcard, 'Platform <A> & B');
    expect(withProject).toContain('Platform &lt;A&gt; &amp; B</span>');
    expect(withProject).not.toContain('<A>');
    expect(withProject).not.toContain('cell project empty');
  });

  it('leaves the project box empty without a project name', () => {
    expect(html).toContain('cell project empty');
  });

  it('renders a cover page without activities', () => {
    const empty = renderJobcardHtml({ ...jobcard, activities: [] });
    expect(count(empty, '<section class="sheet cover">')).toBe(1);
    expect(empty).not.toContain('<li>');
  });
});
