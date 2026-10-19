import { describe, expect, it } from 'vitest';
import { renderActivityHtml } from './render-activity';
import { count, jobcard } from './test-fixtures';

describe('renderActivityHtml', () => {
  const html = renderActivityHtml(jobcard, jobcard.activities[1]!);

  it('renders one activity page', () => {
    expect(count(html, '<section class="sheet')).toBe(1);
    expect(count(html, '<section class="sheet activity">')).toBe(1);
  });

  it('shows only the given activity, escaped', () => {
    expect(html).toContain('Activity:</span>');
    expect(html).toContain('<li>Second &lt;b&gt;</li>');
    expect(html).not.toContain('First');
  });

  it('shows the project name in the title block, escaped', () => {
    const withProject = renderActivityHtml(jobcard, jobcard.activities[1]!, 'Platform <A> & B');
    expect(withProject).toContain('Platform &lt;A&gt; &amp; B</span>');
    expect(withProject).not.toContain('<A>');
    expect(withProject).not.toContain('cell project empty');
    expect(html).toContain('cell project empty');
  });

  it('shows the jobcard title in the title block, escaped', () => {
    expect(count(html, 'class="title-block"')).toBe(1);
    expect(html).toContain('Remove &lt;grating&gt; &amp; handrail</span>');
    expect(html).not.toContain('<grating>');
  });
});
