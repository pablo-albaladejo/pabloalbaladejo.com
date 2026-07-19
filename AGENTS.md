<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# pabloalbaladejo.com

## Purpose
Personal-brand site for Pablo Albaladejo: an Astro 5 static site (Tailwind CSS 4, editorial "Sobria authority" design — Source Serif 4, paper/ink palette with a bermellón accent, class-based light/dark theme) deployed to AWS (S3 + CloudFront) via GitHub Actions OIDC. It carries four pages (Home, Writing/blog, Talks, CV) plus a markdown blog collection, and is built GEO-first (llms.txt, robots rules for AI crawlers, JSON-LD, sitemap, RSS) so AI answer engines and agents can index it accurately. Every page gets a build-time 1200×630 Open Graph card rendered with satori + resvg. AWS infrastructure (CDK) lives in `infra/`, versioned in this same repo but with its own package manager root.

## Key Files
| File | Description |
|------|--------------|
| `package.json` | Astro site manifest — `dev`/`build`/`preview` scripts, Astro 5 + MDX + sitemap + RSS + satori/resvg deps, Tailwind 4 dev dep. No test script: `pnpm build` is the CI gate. |
| `astro.config.mjs` | Astro config: site URL, `trailingSlash: "never"`, i18n scaffold (`en` default, `es` declared but no localized routes exist yet), MDX + sitemap integrations, Tailwind Vite plugin. |
| `tsconfig.json` | Extends `astro/tsconfigs/strict`; includes `src/**/*`; excludes `dist` and `infra` (infra has its own tsconfig/build). |
| `.gitignore` | Ignores `node_modules/`, `dist/`, `.astro/`, `infra/cdk.out/`, `infra/node_modules/`, `.DS_Store`. |
| `pnpm-lock.yaml` | Lockfile for the site's pnpm workspace root (separate lockfile exists in `infra/`). |
| `README.md` | One-paragraph project description plus `pnpm install`/`pnpm dev` and a note that `main` deploys via GitHub Actions OIDC. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | Astro site source — pages, layouts, content collection, lib, styles (see `src/AGENTS.md`). |
| `public/` | Static assets served as-is: favicon, CV PDF, `llms.txt`, `robots.txt` (see `public/AGENTS.md`). |
| `infra/` | AWS CDK app: `SiteStack` (S3+CloudFront+Route53+ACM+OIDC deploy role) and `EmailStack` (isolated SES talks@ forwarder) (see `infra/AGENTS.md`). |
| `marketing/` | Non-code marketing drafts (CFP pitches, LinkedIn copy) — reference material for Pablo, not consumed by the build (see `marketing/AGENTS.md`). |
| `.github/workflows/` | CI/CD: PR build+JSON-LD check, and push-to-main deploy to S3/CloudFront (see `.github/workflows/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- **Every change lands as a PR; Pablo merges.** Agents never push to `main` or merge their own PRs.
- Package manager is **pnpm** (not npm/yarn) — use `pnpm install`, `pnpm add`, etc.
- The site (`/`) and infra (`infra/`) are two separate pnpm roots with their own `package.json`/lockfile; `pnpm install` in one does not install the other.
- Astro content lives under `src/`; anything in `dist/`, `.astro/`, `node_modules/`, `infra/cdk.out/`, `infra/node_modules/` is generated/vendored — never hand-edit or commit it (all gitignored).

### Testing Requirements
- **`pnpm build` is the gate.** There is no separate unit test suite — a clean Astro static build (and, on PRs, a JSON-LD validation pass over the built HTML, see `.github/workflows/AGENTS.md`) is what CI and reviewers rely on.
- Run `pnpm build` locally before opening a PR for any change under `src/` or `astro.config.mjs`.
- Infra changes (`infra/`) are verified with `pnpm --dir infra exec cdk synth`, not the site build; CDK deploys are run manually by Pablo (`pnpm --dir infra exec cdk deploy`), not from CI.

### Common Patterns
- **Content additions propagate to GEO surfaces.** A new blog post (markdown in `src/content/blog/`) must also be added to `public/llms.txt` under "Writing"; the sitemap, RSS feed, and per-post OG card are generated automatically at build time from the content collection — no manual step needed for those three.
- **OG social cards**: every page/post gets one 1200×630 PNG generated at build via `src/lib/og-card.ts` + the catch-all route `src/pages/og/[...route].png.ts` (satori renders a virtual-DOM tree to SVG, `@resvg/resvg-js` rasterises to PNG). A separate 180×180 apple-touch-icon uses the same renderer (`src/pages/apple-touch-icon.png.ts`).
- **Theme**: class-based dark mode driven by a `.dark` class on `<html>`, toggled by a no-flash inline script in `src/layouts/Base.astro` (runs before first paint) and a footer script that cycles System → Light → Dark and persists the choice to `localStorage`. Design tokens (light values + `.dark` overrides) live in `src/styles/global.css` as a Tailwind 4 `@theme` block plus a `@custom-variant dark (&:where(.dark, .dark *))` so the `dark:` variant tracks the class, not `prefers-color-scheme`.
- **Email is never plaintext.** Contact links use `data-email`/`data-domain` (and optional `data-subject`) attributes; a footer script in `Base.astro` assembles the `mailto:` href at runtime so harvester bots scraping static HTML never see the address. The `href` in markup is a LinkedIn URL as a no-JS fallback.
- **JSON-LD**: every page injects schema.org structured data (`Person`/`ProfilePage`/`Article`/`FAQPage`) as an inline `<script type="application/ld+json">` via the `slot="head"` pattern into `Base.astro`. PR CI parses every such block out of the built `dist/` HTML and fails the build if any block is invalid JSON.

## Dependencies

### Internal
- `src/` depends on nothing outside the repo except `public/` (static assets referenced by URL) and the AWS resources `infra/` provisions (bucket name, distribution ID, deploy role ARN are read from CDK outputs and wired into `.github/workflows/deploy.yml` as repository variables — the site code has no direct coupling to `infra/`).

### External
- **Astro 5** — static site generator, file-based routing, content collections.
- **Tailwind CSS 4** (`@tailwindcss/vite`) — utility CSS, `@theme`/`@custom-variant` for design tokens and dark mode.
- **@astrojs/mdx**, **@astrojs/sitemap**, **@astrojs/rss** — MDX support, sitemap generation, RSS feed.
- **satori** + **@resvg/resvg-js** — build-time OG card / icon PNG rendering (prebuilt binaries, no system rasteriser needed).
- **@fontsource/source-serif-4** / **@fontsource-variable/source-serif-4** — the serif typeface, both variable (web) and static-weight `.woff` (satori) forms.
- **AWS** (via `infra/`) — S3, CloudFront, ACM, Route 53, IAM OIDC, SES — the deploy target.
- **GitHub Actions** — CI (`pr-checks.yml`) and CD (`deploy.yml`), authenticating to AWS via OIDC (no long-lived keys).
- **Umami** — privacy-friendly analytics, loaded client-side in `Base.astro` when `PUBLIC_UMAMI_WEBSITE_ID` is set.

<!-- MANUAL: notes below this line are preserved on regeneration -->
