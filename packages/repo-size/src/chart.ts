import type { Sample } from './history.ts';

const WIDTH = 800;
const HEIGHT = 360;
const MARGIN = { top: 56, right: 24, bottom: 36, left: 64 };
const MAX_LANGUAGES = 6;
// Colour-blind-safe categorical palette, plus grey for "Other".
const COLOURS = ['#2a6fdb', '#e08a1e', '#2f9e6b', '#c9457a', '#7c5cc4', '#1f9db0'];
const OTHER_COLOUR = '#8a8f98';

export function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Round the axis maximum up to 1, 2, 2.5, 5 × 10^n so ticks are readable. */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  const n = value / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

/** Languages by size in the latest sample; everything past the top few is grouped as "Other". */
export function seriesNames(samples: Sample[]): string[] {
  const latest = samples[samples.length - 1];
  if (!latest) return [];
  const ranked = Object.entries(latest.languages)
    .sort((a, b) => b[1].code - a[1].code)
    .map(([name]) => name);
  const top = ranked.slice(0, MAX_LANGUAGES);
  return ranked.length > MAX_LANGUAGES ? [...top, 'Other'] : top;
}

function codeFor(sample: Sample, series: string, names: string[]): number {
  if (series !== 'Other') return sample.languages[series]?.code ?? 0;
  const named = new Set(names);
  return Object.entries(sample.languages)
    .filter(([name]) => !named.has(name))
    .reduce((sum, [, c]) => sum + c.code, 0);
}

const fmt = (n: number) => n.toLocaleString('en-GB');

/**
 * Stacked area chart of lines of code per language over time.
 * Self-contained SVG (own background, system fonts) so it reads in light and dark pages.
 */
export function renderSvg(samples: Sample[]): string {
  const latest = samples[samples.length - 1];
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">`;
  const bg = `<rect width="${WIDTH}" height="${HEIGHT}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
  if (!latest) {
    return `${head}<title>Repo size</title>${bg}<text x="${WIDTH / 2}" y="${HEIGHT / 2}" text-anchor="middle" fill="#475467" font-size="14">No data yet</text></svg>\n`;
  }

  const names = seriesNames(samples);
  const plotW = WIDTH - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const t0 = Date.parse(samples[0]!.date);
  const t1 = Date.parse(latest.date);
  const yMax = niceMax(Math.max(...samples.map((s) => s.total.code)));
  const x = (t: number) => MARGIN.left + (t1 === t0 ? plotW / 2 : ((t - t0) / (t1 - t0)) * plotW);
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;

  // Cumulative tops per series, bottom series first.
  const cumulative = samples.map((s) => {
    let acc = 0;
    return names.map((n) => (acc += codeFor(s, n, names)));
  });

  const areas = names
    .map((name, i) => {
      const upper = samples.map(
        (s, k) => `${x(Date.parse(s.date)).toFixed(1)},${y(cumulative[k]![i]!).toFixed(1)}`,
      );
      const lower = samples
        .map(
          (s, k) =>
            `${x(Date.parse(s.date)).toFixed(1)},${y(i === 0 ? 0 : cumulative[k]![i - 1]!).toFixed(1)}`,
        )
        .reverse();
      const colour = name === 'Other' ? OTHER_COLOUR : COLOURS[i % COLOURS.length]!;
      return `<polygon points="${[...upper, ...lower].join(' ')}" fill="${colour}" fill-opacity="0.85" stroke="#ffffff" stroke-width="0.5"><title>${escapeXml(name)}</title></polygon>`;
    })
    .join('');

  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => {
      const v = yMax * f;
      return `<line x1="${MARGIN.left}" x2="${WIDTH - MARGIN.right}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="#eaecf0"/><text x="${MARGIN.left - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#475467">${fmt(v)}</text>`;
    })
    .join('');

  const day = (t: number) => new Date(t).toISOString().slice(0, 10);
  const xLabels = `<text x="${MARGIN.left}" y="${HEIGHT - 12}" font-size="11" fill="#475467">${day(t0)}</text><text x="${WIDTH - MARGIN.right}" y="${HEIGHT - 12}" text-anchor="end" font-size="11" fill="#475467">${day(t1)}</text>`;

  const legend = names
    .map((name, i) => {
      const colour = name === 'Other' ? OTHER_COLOUR : COLOURS[i % COLOURS.length]!;
      const lx = MARGIN.left + i * 110;
      return `<rect x="${lx}" y="36" width="10" height="10" rx="2" fill="${colour}"/><text x="${lx + 14}" y="45" font-size="11" fill="#344054">${escapeXml(name)}</text>`;
    })
    .join('');

  const title = `<text x="${MARGIN.left}" y="24" font-size="15" font-weight="600" fill="#101828">Lines of code: ${fmt(latest.total.code)}</text><text x="${WIDTH - MARGIN.right}" y="24" text-anchor="end" font-size="11" fill="#475467">${fmt(latest.total.files)} files · ${fmt(latest.total.lines)} lines incl. comments and blanks</text>`;

  return `${head}<title>Repo size over time (scc)</title>${bg}${title}${legend}${grid}${areas}${xLabels}</svg>\n`;
}
