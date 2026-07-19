<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->
<!-- NOTE: named `_AGENTS.md` (not `AGENTS.md`) because Astro's file-based
     router treats every `.md` file under `src/pages/` as a public route.
     A plain `AGENTS.md` here would build to a live page at `/AGENTS/`.
     The leading underscore is Astro's documented convention for excluding
     a file from routing while still colocating it in the directory. Same
     applies to `blog/_AGENTS.md` and `og/_AGENTS.md` below. -->

# pages

## Purpose
File-based Astro routes for the whole site: the top-level pages (Home, Talks, CV, 404), build-time API-style endpoints (RSS feed, apple-touch-icon PNG), and two nested route groups (`blog/` for the writing section, `og/` for Open Graph card generation).

## Key Files
| File | Description |
|------|--------------|
| `index.astro` | Home page (`/`). Positioning statement, project list (Kaiord flagship + four other projects), recent-writing list, elsewhere links (GitHub/LinkedIn/StackOverflow/email). Emits a `Person` JSON-LD block. |
| `talks.astro` | `/talks` — speaker bio (short + long), three talk abstracts, a "proof" list of verifiable links, and an invite CTA with the obfuscated-email pattern. |
| `cv.astro` | `/cv` — full work history, AWS certifications, education, featured projects. Conditionally renders a PDF download button only if `public/Pablo_Albaladejo_CV.pdf` exists (`fs.existsSync` at build time). Emits a `ProfilePage`/`Person` JSON-LD block. |
| `404.astro` | Custom not-found page; wired as the CloudFront error response for HTTP 403/404 (see `infra/lib/site-stack.ts`). |
| `rss.xml.js` | Build-time RSS feed endpoint using `@astrojs/rss`, sourced from the `blog` content collection sorted newest-first. |
| `apple-touch-icon.png.ts` | Build-time endpoint returning a 180×180 PNG of the "pa" logo tile, rendered via `renderIcon()` in `src/lib/og-card.ts`. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `blog/` | Writing index (`/blog`) and per-post detail route (`/blog/[slug]`) (see `blog/_AGENTS.md`). |
| `og/` | Single catch-all endpoint that renders the 1200×630 OG card PNG for every page/post (see `og/_AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every visible page wraps its content in `<Base>` (from `src/layouts/Base.astro`), passing at minimum `title`, `description`, `lang="en"`, and `path`; set `active` to `"writing" | "talks" | "cv"` to highlight the matching nav link, and `ogImage` to point at the corresponding route under `og/`.
- `.ts`/`.js` files with a `.png.ts`/`.xml.js` suffix are Astro **endpoints** (export a `GET`, sometimes `getStaticPaths`), not visual pages — they run at build time only (this is a fully static site, no SSR adapter).
- JSON-LD blocks are injected via `<script type="application/ld+json" set:html={json} slot="head" />` — the `slot="head"` is required for `Base.astro` to place it correctly; PR CI (`pr-checks.yml`) parses and validates every such block in the built output.

### Testing Requirements
- `pnpm build` from the repo root must succeed and produce the expected static routes; spot-check new/changed pages with `pnpm dev`.
- If you add a page, confirm its JSON-LD (if any) is valid JSON and that its `ogImage` path exists as a target in `src/pages/og/[...route].png.ts`'s `targets()` function (fixed pages are listed explicitly there; blog posts are derived automatically from the collection).

### Common Patterns
- English-only content today despite the `es` locale declared in `astro.config.mjs` — no localized routes exist yet; don't assume `/es/...` paths work.
- Dates are formatted `YYYY-MM-DD` via a local `fmt = (d: Date) => d.toISOString().slice(0, 10)` helper, duplicated per page rather than shared — match this pattern rather than introducing a new date-formatting utility for a single extra call site.

## Dependencies

### Internal
- All pages import `../layouts/Base.astro` (or `../../layouts/Base.astro` from `blog/`).
- `index.astro`, `blog/index.astro`, `blog/[...slug].astro`, `rss.xml.js` read the `blog` collection via `astro:content` (`getCollection`/`render`), defined in `src/content.config.ts`.
- `apple-touch-icon.png.ts` and `og/[...route].png.ts` import `../lib/og-card.ts`.

### External
- `astro:content` (`getCollection`, `render`, `getStaticPaths` types) — Astro's content API.
- `@astrojs/rss` — RSS feed serialization in `rss.xml.js`.

<!-- MANUAL: notes below this line are preserved on regeneration -->
