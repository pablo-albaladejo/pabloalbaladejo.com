#!/usr/bin/env node
// Aggregates the site CloudFront access logs into per-day crawler
// stats: which search/AI bots hit which URLs. This is the earliest signal in
// the funnel (crawl precedes indexation precedes ranking) and the only one
// available without third-party consoles.
//
// Requires AWS credentials that can read the prod cdn-logs bucket
// (locally: AWS_PROFILE=deepgent-admin). Uses the aws CLI for the S3 sync.
//   node scripts/geo/crawler-stats.mjs [--bucket <name>] [--days N]
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { appendJsonl, timeseriesDir, todayIso, writeSnapshot } from './observatory-lib.mjs';

const args = process.argv.slice(2);
const argValue = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
};

const discoverBucket = () => {
  const out = execFileSync(
    'aws',
    ['s3api', 'list-buckets', '--query', 'Buckets[].Name', '--output', 'text'],
    { encoding: 'utf8' }
  );
  const matches = out
    .split(/\s+/)
    .filter((n) => n.includes('cdnlogs') && n.includes('pabloalbaladejo'));
  if (matches.length !== 1) {
    throw new Error(
      `expected exactly one prod cdn-logs bucket, found: ${matches.join(', ') || 'none'} — pass --bucket <name>`
    );
  }
  return matches[0];
};

const bucket = argValue('--bucket') ?? process.env.SEO_CDN_LOG_BUCKET ?? discoverBucket();
const days = Number(argValue('--days') ?? 30);

const cacheDir = join(tmpdir(), 'pabloalbaladejo-cdn-logs');
mkdirSync(cacheDir, { recursive: true });
console.log(`[crawler] syncing s3://${bucket}/site-cdn/ ...`);
execFileSync('aws', ['s3', 'sync', `s3://${bucket}/site-cdn/`, cacheDir, '--quiet'], {
  stdio: 'inherit',
});

// UA families. Order matters: the first match wins, most-specific first.
const BOT_FAMILIES = [
  ['googlebot', /Googlebot|Google-Extended|Storebot-Google/i],
  ['bingbot', /bingbot|BingPreview/i],
  ['gptbot', /GPTBot/],
  ['oaiSearchbot', /OAI-SearchBot/],
  ['chatgptUser', /ChatGPT-User/],
  ['claudebot', /ClaudeBot|Claude-Web|Claude-User/i],
  ['perplexitybot', /Perplexity/i],
  ['amazonbot', /Amazonbot/],
  ['applebot', /Applebot/],
  ['ccbot', /CCBot/],
  ['metabot', /meta-externalagent|facebookexternalhit/i],
  ['duckduckbot', /DuckDuck/i],
  ['otherBot', /[Bb]ot|[Cc]rawl|[Ss]pider/],
];

// Scanners spoof search-engine UAs while probing for leaked secrets; counting
// them as real crawlers would fake crawl demand. Path heuristic (rDNS
// verification would be exact but needs a network lookup per hit).
const SPOOF_PATH = /\/\.|secrets|\.env|config\.(json|ya?ml)|\.npmrc|\.pypirc|wp-|phpinfo/i;

const today = todayIso();
const sinceDate = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
const perDay = new Map();

for (const file of readdirSync(cacheDir).filter((f) => f.endsWith('.gz'))) {
  const lines = gunzipSync(readFileSync(join(cacheDir, file)))
    .toString('utf8')
    .split('\n');
  for (const line of lines) {
    if (line === '' || line.startsWith('#')) continue;
    const fields = line.split('\t');
    const [date, , , , , , , uri, status] = fields;
    const ua = fields[10] ?? '';
    // Skip incomplete data: today's logs are still arriving.
    if (date === undefined || date >= today || date < sinceDate) continue;

    if (!perDay.has(date)) {
      perDay.set(date, { total: 0, human: 0, spoofed: 0, bots: {} });
    }
    const day = perDay.get(date);
    day.total += 1;

    const family = BOT_FAMILIES.find(([, pattern]) => pattern.test(ua))?.[0];
    if (family === undefined) {
      day.human += 1;
      continue;
    }
    if (['googlebot', 'bingbot'].includes(family) && SPOOF_PATH.test(uri)) {
      day.spoofed += 1;
      continue;
    }
    if (day.bots[family] === undefined)
      day.bots[family] = { hits: 0, urls: new Set(), statuses: {} };
    day.bots[family].hits += 1;
    day.bots[family].urls.add(uri);
    day.bots[family].statuses[status] = (day.bots[family].statuses[status] ?? 0) + 1;
  }
}

const dates = [...perDay.keys()].sort();
let appendedCount = 0;
for (const date of dates) {
  const day = perDay.get(date);
  const entry = {
    date,
    source: 'cdn-logs',
    total: day.total,
    human: day.human,
    spoofedSearchBotHits: day.spoofed,
    bots: Object.fromEntries(
      Object.entries(day.bots).map(([family, stats]) => [
        family,
        {
          hits: stats.hits,
          urls: [...stats.urls].slice(0, 30),
          statuses: stats.statuses,
        },
      ])
    ),
  };
  if (appendJsonl(join(timeseriesDir, 'crawler.jsonl'), entry)) appendedCount += 1;
}

writeSnapshot(`crawler-${today}`, {
  bucket,
  window: { since: sinceDate, until: today },
  days: Object.fromEntries(
    dates.map((d) => [
      d,
      {
        ...perDay.get(d),
        bots: Object.fromEntries(
          Object.entries(perDay.get(d).bots).map(([f, s]) => [
            f,
            { hits: s.hits, urls: [...s.urls], statuses: s.statuses },
          ])
        ),
      },
    ])
  ),
});

console.log(
  `[crawler] ${appendedCount} new day(s) recorded (${dates[0] ?? 'n/a'}..${dates.at(-1) ?? 'n/a'})`
);
for (const date of dates) {
  const bots = perDay.get(date).bots;
  const summary = Object.entries(bots)
    .filter(([family]) => family !== 'otherBot')
    .map(([family, stats]) => `${family}:${stats.hits}`)
    .join(' ');
  console.log(`  ${date} total=${perDay.get(date).total} ${summary}`);
}
