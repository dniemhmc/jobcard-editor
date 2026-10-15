import { describe, expect, it } from 'vitest';
import { renderJobcardSheetsHtml } from './render-jobcard-sheets';
import { SAMPLE_SHEET_DATA } from './sample-sheet-data';

describe('renderJobcardSheetsHtml', () => {
  const html = renderJobcardSheetsHtml(SAMPLE_SHEET_DATA);

  it('prints A4 portrait pages, one section per sheet', () => {
    expect(html).toContain('size: A4 portrait');
    expect(html.match(/<section class="sheet /g)).toHaveLength(4);
  });

  it('puts the title block with "n of N" on every sheet', () => {
    expect(html.match(/<footer class="tb">/g)).toHaveLength(4);
    for (const n of [1, 2, 3, 4]) expect(html).toContain(`>${n} of 4<`);
    expect(html.match(/HD-M03-HVAC-01/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('lists the main activities on the front sheet and numbers detailed steps per activity', () => {
    expect(html).toContain('<li>Cut and remove ducting sections</li>');
    expect(html).toContain('Main activity step 2: Cut and remove ducting sections');
    expect(html).toContain('<td class="n">2.5</td>');
  });

  it('ticks only the selected hazards', () => {
    expect(html).toContain('<span class="cb">✕</span>Hot work');
    expect(html).toContain('<span class="cb"></span>NORM');
  });

  it('colours the discipline bar from the lookup', () => {
    expect(html).toContain('background:#e07b1a;color:#ffffff">WLDR');
  });

  it('escapes every interpolated value', () => {
    const evil = renderJobcardSheetsHtml({
      ...SAMPLE_SHEET_DATA,
      titleBlock: { ...SAMPLE_SHEET_DATA.titleBlock, title: '<b>x</b> & "y"' },
      generalPictures: [{ caption: '<img onerror=1>', src: '"><script>' }],
      activities: [
        {
          title: '<script>alert(1)</script>',
          disciplines: [{ code: 'SUBCON', scope: '<i>NDT</i>' }],
          steps: [{ text: 'a<b', details: 'c>d' }],
          hazardsAndPrecautions: ['<hr>'],
          pictures: [],
        },
      ],
    });
    expect(evil).not.toMatch(/<script>|<b>x|<img onerror|<i>NDT|<hr>/);
    expect(evil).toContain('&lt;b&gt;x&lt;/b&gt; &amp; &quot;y&quot;');
    expect(evil).toContain('SUBCON – &lt;i&gt;NDT&lt;/i&gt;');
  });
});
