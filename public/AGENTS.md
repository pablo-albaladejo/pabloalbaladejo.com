<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# public

## Purpose
Static assets served verbatim at the site root by Astro (copied as-is into `dist/` during build, no processing). Holds the favicon source, the downloadable CV PDF, and the two GEO/crawler-facing text files (`llms.txt`, `robots.txt`).

## Key Files
| File | Description |
|------|--------------|
| `favicon.svg` | The "pa" logo mark as inline SVG (dark rounded square, serif "pa" in paper color, bermellón accent bar) — referenced from `Base.astro`'s `<link rel="icon">`. Same lockup is redrawn at build time by `src/lib/og-card.ts` for OG cards and the apple-touch-icon PNG. |
| `Pablo_Albaladejo_CV.pdf` | The downloadable CV, linked from `src/pages/cv.astro`. `cv.astro` checks for this file's existence at build time (`fs.existsSync`) and only renders the download button if present. |
| `llms.txt` | Machine-readable map of the site for AI agents/answer engines (GEO): links to Home/Talks/CV, every blog post with a one-line summary, project list, and profile links. **Must be updated whenever a new blog post or page is added** — this is the one GEO surface that is not auto-generated. |
| `robots.txt` | Standard crawler rules (`Allow: /` for all agents) plus the sitemap URL and a comment pointing AI crawlers at `llms.txt`. |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- Files here are served at the site root exactly as named (`public/llms.txt` → `https://pabloalbaladejo.com/llms.txt`) — do not nest assets in subfolders unless the URL path is meant to include that folder.
- `apple-touch-icon.png` and OG-card PNGs are **not** in this directory — they're generated at build time by `src/pages/apple-touch-icon.png.ts` and `src/pages/og/[...route].png.ts` via `src/lib/og-card.ts`, so don't add static PNGs here that would shadow those routes.
- When adding a new blog post (`src/content/blog/*.md`) or a new top-level page, add a corresponding entry to `llms.txt` in the same PR — sitemap, RSS, and the OG card are automatic, but `llms.txt` is hand-maintained.

### Testing Requirements
- `pnpm build` copies this directory into `dist/` unchanged; verify the built output includes any new/changed file and that `llms.txt` entries link to real, existing routes.

### Common Patterns
- `llms.txt` entries are one bullet per page/post: a link followed by a short, factual, one-line description — keep new entries in that same terse style.

## Dependencies

### Internal
- Referenced by `src/layouts/Base.astro` (favicon, apple-touch-icon), `src/pages/cv.astro` (CV PDF), `src/pages/rss.xml.js` and the sitemap integration (indirectly, via `astro.config.mjs`).

### External
None.

<!-- MANUAL: notes below this line are preserved on regeneration -->
