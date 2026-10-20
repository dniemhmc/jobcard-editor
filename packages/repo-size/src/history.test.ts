import { describe, expect, it } from 'vitest';
import {
  addSample,
  lastPerDay,
  parseHistory,
  sampleFromScc,
  serialiseHistory,
  type Sample,
} from './history.ts';

const scc = [
  { Name: 'TypeScript', Count: 3, Lines: 100, Code: 80, Comment: 10, Blank: 10 },
  { Name: 'JSON', Count: 1, Lines: 20, Code: 20, Comment: 0, Blank: 0 },
];

const sample = (commit: string, date: string, code = 1): Sample => ({
  commit,
  date,
  total: { files: 1, lines: code, code },
  languages: { TypeScript: { files: 1, lines: code, code } },
});

describe('sampleFromScc', () => {
  it('sums totals across languages', () => {
    const s = sampleFromScc(scc, { commit: 'abc', date: '2026-01-01T00:00:00Z' });
    expect(s.total).toEqual({ files: 4, lines: 120, code: 100 });
    expect(s.languages['JSON']).toEqual({ files: 1, lines: 20, code: 20 });
  });

  it('rejects malformed scc output', () => {
    expect(() =>
      sampleFromScc({ nope: 1 }, { commit: 'abc', date: '2026-01-01T00:00:00Z' }),
    ).toThrow();
  });
});

describe('history', () => {
  it('round-trips through JSONL, sorted by date', () => {
    const a = sample('a', '2026-01-02T00:00:00Z');
    const b = sample('b', '2026-01-01T00:00:00Z');
    expect(parseHistory(serialiseHistory([a, b]))).toEqual([b, a]);
  });

  it('replaces an existing sample for the same commit', () => {
    const first = sample('a', '2026-01-01T00:00:00Z', 1);
    const rerun = sample('a', '2026-01-01T00:00:00Z', 2);
    expect(addSample([first], rerun)).toEqual([rerun]);
  });

  it('keeps the last sample of each day', () => {
    const out = lastPerDay([
      sample('a', '2026-01-01T08:00:00Z'),
      sample('b', '2026-01-01T17:00:00Z'),
      sample('c', '2026-01-02T08:00:00Z'),
    ]);
    expect(out.map((s) => s.commit)).toEqual(['b', 'c']);
  });
});
