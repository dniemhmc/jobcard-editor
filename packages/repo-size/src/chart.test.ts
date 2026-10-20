import { describe, expect, it } from 'vitest';
import { niceMax, renderSvg, seriesNames } from './chart.ts';
import type { Sample } from './history.ts';

const sample = (date: string, languages: Record<string, number>): Sample => {
  const entries = Object.entries(languages).map(
    ([k, code]) => [k, { files: 1, lines: code, code }] as const,
  );
  const code = Object.values(languages).reduce((a, b) => a + b, 0);
  return {
    commit: date,
    date,
    total: { files: entries.length, lines: code, code },
    languages: Object.fromEntries(entries),
  };
};

describe('niceMax', () => {
  it.each([
    [0, 1],
    [730, 1000],
    [1200, 2000],
    [3100, 5000],
    [5001, 10000],
  ])('%d -> %d', (input, expected) => {
    expect(niceMax(input)).toBe(expected);
  });
});

describe('seriesNames', () => {
  it('orders by size and groups the tail as Other', () => {
    const langs = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`L${i}`, 100 - i]));
    const names = seriesNames([sample('2026-01-01T00:00:00Z', langs)]);
    expect(names).toEqual(['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'Other']);
  });
});

describe('renderSvg', () => {
  it('renders an empty state', () => {
    expect(renderSvg([])).toContain('No data yet');
  });

  it('renders one area per series and the latest total', () => {
    const svg = renderSvg([
      sample('2026-01-01T00:00:00Z', { TypeScript: 100, JSON: 10 }),
      sample('2026-02-01T00:00:00Z', { TypeScript: 200, JSON: 10 }),
    ]);
    expect(svg.match(/<polygon/g)).toHaveLength(2);
    expect(svg).toContain('Lines of code: 210');
  });

  it('escapes language names', () => {
    const svg = renderSvg([sample('2026-01-01T00:00:00Z', { '<b>&': 5 })]);
    expect(svg).not.toContain('<b>');
    expect(svg).toContain('&#60;b&#62;&#38;');
  });
});
