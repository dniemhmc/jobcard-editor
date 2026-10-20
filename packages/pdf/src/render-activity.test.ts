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
    const withProject = renderActivityHtml(jobcard, jobcard.activities[1]!, {
      project: { name: 'Platform <A> & B', jobNumber: 'PO <1> & 2' },
      workpack: {
        module: 'Module <M> & 1',
        department: 'Dept <D> & 2',
        revision: 'Rev <R> & 3',
        date: '2026-03-23',
      },
    });
    expect(withProject).toContain('Platform &lt;A&gt; &amp; B</span>');
    expect(withProject).toContain('PO &lt;1&gt; &amp; 2</span>');
    expect(withProject).toContain('Module &lt;M&gt; &amp; 1</span>');
    expect(withProject).toContain('Dept &lt;D&gt; &amp; 2</span>');
    expect(withProject).toContain('Rev &lt;R&gt; &amp; 3</span>');
    expect(withProject).toContain('23-03-2026</span>');
    expect(withProject).not.toContain('<D>');
    expect(withProject).not.toContain('<R>');
    expect(withProject).not.toContain('<A>');
    expect(withProject).not.toContain('<1>');
    expect(withProject).not.toContain('cell project empty');
    expect(withProject).not.toContain('cell job-no empty');
    expect(withProject).not.toContain('cell module empty');
    expect(withProject).not.toContain('cell department empty');
    expect(withProject).not.toContain('cell rev empty');
    expect(withProject).not.toContain('cell date empty');
    expect(html).toContain('cell project empty');
  });

  it('shows the JC number of the jobcard, escaped', () => {
    const numbered = renderActivityHtml(
      { ...jobcard, jcNumber: 'JC <7> & 8' },
      jobcard.activities[0]!,
    );
    expect(numbered).toContain('JC &lt;7&gt; &amp; 8</span>');
    expect(numbered).not.toContain('<7>');
    expect(html).toContain('cell jc-no empty');
  });

  it('numbers activity sheets after the cover page', () => {
    expect(renderActivityHtml(jobcard, jobcard.activities[0]!)).toContain('>2 of 3</span>');
    expect(html).toContain('>3 of 3</span>');
  });

  it('leaves the sheet number empty for an activity that is not on the jobcard', () => {
    const stray = { id: '00000000-0000-4000-8000-000000000099', name: 'Stray' };
    expect(renderActivityHtml(jobcard, stray)).toContain('cell sht empty');
  });

  it('shows the jobcard title in the title block, escaped', () => {
    expect(count(html, 'class="title-block"')).toBe(1);
    expect(html).toContain('Remove &lt;grating&gt; &amp; handrail</span>');
    expect(html).not.toContain('<grating>');
  });
});
