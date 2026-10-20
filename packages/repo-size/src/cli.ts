/**
 * Usage (Node 22 runs TypeScript directly):
 *   node src/cli.ts sample   <history.jsonl> <scc.json> <commit> <date>
 *   node src/cli.ts render   <history.jsonl> <out.svg>
 *   node src/cli.ts backfill <history.jsonl> <scc-binary>   (run inside a full git clone)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderSvg } from './chart.ts';
import {
  addSample,
  lastPerDay,
  parseHistory,
  sampleFromScc,
  serialiseHistory,
  type Sample,
} from './history.ts';

const readHistory = (path: string) =>
  existsSync(path) ? parseHistory(readFileSync(path, 'utf8')) : [];

function backfill(historyPath: string, scc: string): void {
  const log = execFileSync('git', ['log', '--first-parent', '--format=%H %cI'], {
    encoding: 'utf8',
  });
  const commits = log
    .trim()
    .split('\n')
    .map((line) => {
      const [commit = '', date = ''] = line.split(' ');
      return { commit, date };
    });
  // Pick the commits first so we only measure one per day.
  const picked = lastPerDay(
    commits.map(({ commit, date }) => ({
      commit,
      date,
      total: { files: 0, lines: 0, code: 0 },
      languages: {},
    })),
  );
  let history = readHistory(historyPath);
  const work = mkdtempSync(join(tmpdir(), 'repo-size-'));
  try {
    for (const { commit, date } of picked) {
      const dir = join(work, commit);
      execFileSync('mkdir', [dir]);
      const archive = execFileSync('git', ['archive', commit], { maxBuffer: 1 << 30 });
      execFileSync('tar', ['-x', '-C', dir], { input: archive });
      const out = execFileSync(scc, ['--format', 'json', dir], {
        encoding: 'utf8',
        maxBuffer: 1 << 28,
      });
      history = addSample(history, sampleFromScc(JSON.parse(out), { commit, date }));
      rmSync(dir, { recursive: true, force: true });
      console.log(`measured ${commit.slice(0, 8)} ${date}`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  writeFileSync(historyPath, serialiseHistory(history));
}

const [command, ...args] = process.argv.slice(2);
if (command === 'sample' && args.length === 4) {
  const [historyPath, sccPath, commit, date] = args as [string, string, string, string];
  const sample: Sample = sampleFromScc(JSON.parse(readFileSync(sccPath, 'utf8')), { commit, date });
  writeFileSync(historyPath, serialiseHistory(addSample(readHistory(historyPath), sample)));
} else if (command === 'render' && args.length === 2) {
  const [historyPath, out] = args as [string, string];
  writeFileSync(out, renderSvg(readHistory(historyPath)));
} else if (command === 'backfill' && args.length === 2) {
  backfill(args[0]!, args[1]!);
} else {
  console.error(readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]);
  process.exit(1);
}
