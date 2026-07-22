// Shared helpers for the SEO/GEO observatory collectors (reports/seo/).
// Node stdlib only on purpose: the weekly GitHub Actions workflow runs these
// without a pnpm install, and local runs must not depend on workspace state.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const seoDir = join(repoRoot, 'reports', 'seo');
export const timeseriesDir = join(seoDir, 'timeseries');
export const snapshotsDir = join(seoDir, 'snapshots');

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const loadQueries = () => JSON.parse(readFileSync(join(seoDir, 'queries.json'), 'utf8'));

export const readJsonl = (file) => {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line));
};

// One entry per key (default: date+source) — same-day re-runs are no-ops so
// the weekly workflow and manual runs stay idempotent.
export const appendJsonl = (file, entry, keyFields = ['date', 'source']) => {
  const duplicate = readJsonl(file).some((row) => keyFields.every((k) => row[k] === entry[k]));
  if (duplicate) return false;
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(entry)}\n`);
  return true;
};

export const writeSnapshot = (name, data) => {
  mkdirSync(snapshotsDir, { recursive: true });
  const file = join(snapshotsDir, `${name}.json`);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  return file;
};

const parseLocs = (xml) =>
  Array.from(xml.matchAll(/<loc>\s*([^\s<]+)\s*<\/loc>/g), (m) => m[1]);

// @astrojs/sitemap emits a sitemap INDEX whose <loc>s point at child sitemaps;
// resolve one level of nesting so callers always get page URLs.
export const fetchSitemapUrls = async (
  sitemapUrl = 'https://pabloalbaladejo.com/sitemap-index.xml'
) => {
  const xml = await fetch(sitemapUrl).then((res) => res.text());
  let urls = parseLocs(xml);
  if (urls.every((u) => u.endsWith('.xml'))) {
    const children = await Promise.all(
      urls.map((u) => fetch(u).then((res) => res.text()).then(parseLocs))
    );
    urls = children.flat();
  }
  if (urls.length === 0) throw new Error(`no <loc> entries in ${sitemapUrl}`);
  return urls;
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
