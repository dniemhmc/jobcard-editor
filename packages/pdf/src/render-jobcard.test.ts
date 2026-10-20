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
  });

  it('leaves the project and job number boxes empty without a project', () => {
    expect(html).toContain('cell project empty');
    expect(html).toContain('cell job-no empty');
  });

  it('shows the JC number of the jobcard, escaped', () => {
    const numbered = renderJobcardHtml({ ...jobcard, jcNumber: 'JC <7> & 8' });
    expect(numbered).toContain('JC &lt;7&gt; &amp; 8</span>');
    expect(numbered).not.toContain('<7>');
    expect(numbered).not.toContain('cell jc-no empty');
    expect(html).toContain('cell jc-no empty');
  });

  it('leaves the job number and module boxes empty when they are not set', () => {
    const bare = renderJobcardHtml(jobcard, { project: { name: 'Platform A' }, workpack: {} });
    expect(bare).toContain('cell job-no empty');
    expect(bare).toContain('cell module empty');
    expect(bare).toContain('cell department empty');
    expect(bare).toContain('cell rev empty');
    expect(bare).toContain('cell date empty');
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
