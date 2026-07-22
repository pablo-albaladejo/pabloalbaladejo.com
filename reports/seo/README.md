# SEO/GEO observatory

Weekly measurement for pabloalbaladejo.com, ported from the deepgent
observatory. Collectors in `scripts/geo/` write one entry per day to
`timeseries/*.jsonl`; `DASHBOARD.md` is generated — never edit it by hand.
Start point: `baseline-2026-07-22.md`.

## Cadence

`.github/workflows/seo-observatory.yml` runs Mondays and opens a metrics PR
(owner merges, per AGENTS.md). Reviewing the `DASHBOARD.md` diff is the
weekly SEO review. Local runs are idempotent per day:

```bash
node scripts/geo/serp-snapshot.mjs        # keyless (DDG = Bing proxy)
set -a; source ~/keys/deepgent-seo.env; set +a
node scripts/geo/gsc-snapshot.mjs         # needs the service account on THIS property
node scripts/geo/bing-snapshot.mjs        # same Bing account/key as deepgent
AWS_PROFILE=deepgent-admin node scripts/geo/crawler-stats.mjs   # after CloudFront logging deploys
node scripts/geo/seo-dashboard.mjs
```

## One-time setup (owner)

1. Search Console: Verify the property (DNS token live) → submit
   `sitemap-index.xml` → Request indexing for the 8 pages → Settings → Users →
   add `seo-observatory@deepgent-seo.iam.gserviceaccount.com` (Full).
2. Bing Webmaster: Import from GSC (the existing account API key then works).
3. Repo secrets `GSC_SERVICE_ACCOUNT_JSON` + `BING_WEBMASTER_API_KEY` are set.
4. `cdk deploy PabloAlbaladejoSite` to activate CloudFront logging (PR #28),
   then crawler-stats has data.

Entity checklist lives in `directory-status.json` — update it as profiles get
fixed (dev.to bio, GitHub bio link, LinkedIn consolidation, Crunchbase, X).
