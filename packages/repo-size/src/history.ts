import { z } from 'zod';

const Counts = z.object({
  files: z.number().int().nonnegative(),
  lines: z.number().int().nonnegative(),
  code: z.number().int().nonnegative(),
});

/** One data point: the size of the repo at one commit. */
export const SampleSchema = z.object({
  commit: z.string().min(1),
  /** ISO 8601 commit date */
  date: z.iso.datetime({ offset: true }),
  total: Counts,
  languages: z.record(z.string(), Counts),
});
export type Sample = z.infer<typeof SampleSchema>;

/** The subset of `scc --format json` output that we use. */
const SccOutputSchema = z.array(
  z.object({
    Name: z.string(),
    Count: z.number().int().nonnegative(),
    Lines: z.number().int().nonnegative(),
    Code: z.number().int().nonnegative(),
  }),
);

export function sampleFromScc(sccJson: unknown, meta: { commit: string; date: string }): Sample {
  const languages: Sample['languages'] = {};
  const total = { files: 0, lines: 0, code: 0 };
  for (const row of SccOutputSchema.parse(sccJson)) {
    languages[row.Name] = { files: row.Count, lines: row.Lines, code: row.Code };
    total.files += row.Count;
    total.lines += row.Lines;
    total.code += row.Code;
  }
  return SampleSchema.parse({ ...meta, total, languages });
}

export function parseHistory(jsonl: string): Sample[] {
  return jsonl
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => SampleSchema.parse(JSON.parse(line)))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

export function serialiseHistory(samples: Sample[]): string {
  return samples.map((s) => JSON.stringify(s)).join('\n') + '\n';
}

/** Adds a sample, replacing any existing one for the same commit (so re-runs are idempotent). */
export function addSample(history: Sample[], sample: Sample): Sample[] {
  return [...history.filter((s) => s.commit !== sample.commit), sample].sort(
    (a, b) => Date.parse(a.date) - Date.parse(b.date),
  );
}

/** Keeps the last sample of each UTC day. Used to thin out a backfill. */
export function lastPerDay(samples: Sample[]): Sample[] {
  const byDay = new Map<string, Sample>();
  for (const s of [...samples].sort((a, b) => Date.parse(a.date) - Date.parse(b.date))) {
    byDay.set(new Date(s.date).toISOString().slice(0, 10), s);
  }
  return [...byDay.values()];
}
