import { describe, expect, it } from 'vitest';
import { formatSheetDate, sheetCount, sheetDocument, sheetLabel, titleBlock } from './sheet';
import { jobcard } from './test-fixtures';

describe('titleBlock', () => {
  it('escapes every value it prints, once', () => {
    const html = titleBlock(jobcard, {
      projectName: 'Platform <A> & B',
      jobNumber: 'PO <1> & 2',
      module: 'M <1> & 2',
      department: 'D <1> & 2',
      revision: 'R <1> & 2',
      date: '<23-03> & 2026',
      sheet: '1 of <3>',
    });
    expect(html).toContain('Platform &lt;A&gt; &amp; B</span>');
    expect(html).toContain('Remove &lt;grating&gt; &amp; handrail</span>');
    expect(html).toContain('PO &lt;1&gt; &amp; 2</span>');
    expect(html).toContain('M &lt;1&gt; &amp; 2</span>');
    expect(html).toContain('D &lt;1&gt; &amp; 2</span>');
    expect(html).toContain('R &lt;1&gt; &amp; 2</span>');
    expect(html).toContain('&lt;23-03&gt; &amp; 2026</span>');
    expect(html).toContain('1 of &lt;3&gt;</span>');
    expect(html).not.toContain('&amp;amp;');
    expect(html).not.toContain('<A>');
    expect(html).not.toContain('<grating>');
  });

  it('leaves the project and sheet boxes empty without values', () => {
    const html = titleBlock(jobcard);
    expect(html).toContain('cell project empty');
    expect(html).toContain('cell job-no empty');
    expect(html).toContain('cell module empty');
    expect(html).toContain('cell department empty');
    expect(html).toContain('cell rev empty');
    expect(html).toContain('cell date empty');
    expect(html).toContain('cell jc-no empty');
    expect(html).toContain('cell sht empty');
  });
});

describe('title block styles', () => {
  const css = (selector: string) => {
    const html = sheetDocument('t', '', '');
    return new RegExp(`${selector.replace('.', '\\.')} \\{([^}]*)\\}`).exec(html)?.[1] ?? '';
  };

  it('prints the filled-in values in blue', () => {
    expect(css('.cell-value')).toContain('color: #0070C0');
  });

  it('centres the value vertically in its cell', () => {
    expect(css('.cell')).toContain('align-items: center');
    expect(css('.cell-value')).not.toContain('padding-top');
  });
});

describe('formatSheetDate', () => {
  it('prints an ISO date as DD-MM-YYYY, with the day and month padded to two digits', () => {
    expect(formatSheetDate('2026-03-23')).toBe('23-03-2026');
    expect(formatSheetDate('2026-01-05')).toBe('05-01-2026');
    expect(formatSheetDate('2026-12-31')).toBe('31-12-2026');
  });

  it('leaves anything that is not an ISO date as it is', () => {
    expect(formatSheetDate('soon')).toBe('soon');
  });
});

describe('sheet numbering', () => {
  it('counts the cover page plus one sheet per activity', () => {
    expect(sheetCount(jobcard)).toBe(3);
    expect(sheetCount({ ...jobcard, activities: [] })).toBe(1);
  });

  it('labels a sheet "n of x"', () => {
    expect(sheetLabel(1, 3)).toBe('1 of 3');
    expect(sheetLabel(3, 3)).toBe('3 of 3');
  });
});
