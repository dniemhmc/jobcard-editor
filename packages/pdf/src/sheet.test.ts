import { describe, expect, it } from 'vitest';
import { titleBlock } from './sheet';
import { jobcard } from './test-fixtures';

describe('titleBlock', () => {
  it('escapes every value it prints, once', () => {
    const html = titleBlock(jobcard, 'Platform <A> & B');
    expect(html).toContain('Platform &lt;A&gt; &amp; B</span>');
    expect(html).toContain('Remove &lt;grating&gt; &amp; handrail</span>');
    expect(html).not.toContain('&amp;amp;');
    expect(html).not.toContain('<A>');
    expect(html).not.toContain('<grating>');
  });
});
