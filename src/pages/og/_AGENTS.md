<!-- Parent: ../_AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->
<!-- NOTE: named `_AGENTS.md` — see `../_AGENTS.md` for why (Astro routes
     every .md under src/pages/ as a public page). -->

# og

## Purpose
Single catch-all Astro endpoint that generates every Open Graph card PNG the site serves — one per fixed page (home, cv, talks, blog index) plus one per blog post, all at build time.

## Key Files
| File | Description |
|------|--------------|
| `[...route].png.ts` | Defines `targets()`: four fixed `{route, headline, subtitle}` entries plus one derived per `blog` collection entry (`route: "blog/{id}"`, headline = post title, subtitle = truncated description via `truncate()`). `getStaticPaths` maps each target to a static PNG route (`/og/{route}.png`); `GET` calls `renderCard(headline, subtitle)` from `src/lib/og-card.ts` and returns the PNG buffer with `Content-Type: image/png`. |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- This is the **only** place that decides which OG-card routes exist — a new fixed page needs a manually added entry in the `fixed` array inside `targets()`; a new blog post gets a card automatically from the collection, no edit needed here.
- The `route` value becomes the URL segment after `/og/` and the filename before `.png` — for blog posts this is `blog/{entry.id}`, matching what `src/pages/blog/[...slug].astro` sets as `ogImage`. Keep these in sync if either changes.
- All actual rendering (fonts, layout, colors) lives in `src/lib/og-card.ts`; this file only decides *what* to render per route, not *how*.

### Testing Requirements
- `pnpm build` must produce a PNG for every fixed page and every blog post with no 404s; spot-check a rendered card (e.g. open a generated file from `dist/og/`) after adding a page or post whose OG image looks different from expected.

### Common Patterns
- Subtitles for auto-derived (blog) targets are always passed through `truncate()` (from `og-card.ts`) to fit the card; fixed-page subtitles are hand-written short strings and skip truncation since they're already short.

## Dependencies

### Internal
- Depends on `../../lib/og-card.ts` (`renderCard`, `truncate`) and the `blog` collection (`astro:content`).

### External
- `astro:content` (`getCollection`), Astro's `APIRoute`/`GetStaticPaths` types.

<!-- MANUAL: notes below this line are preserved on regeneration -->
