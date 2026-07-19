<!-- Parent: ../_AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->
<!-- NOTE: named `_AGENTS.md` — see `../_AGENTS.md` for why (Astro routes
     every .md under src/pages/ as a public page). -->

# blog

## Purpose
The "Writing" section routes: an index listing every post and a dynamic detail route rendering a single post's markdown content, FAQ, and sources.

## Key Files
| File | Description |
|------|--------------|
| `index.astro` | `/blog` — lists every entry in the `blog` collection, newest first, each linking to `/blog/{id}`. Shows "No posts yet." if the collection is empty. |
| `[...slug].astro` | `/blog/{id}` — `getStaticPaths()` maps every collection entry to a static route. Renders the post body via `render(entry)`, computes a word-count-based read time (`words / 220`, min 1 min), emits `Article` and (if `faq` frontmatter is present) `FAQPage` JSON-LD, and conditionally renders FAQ and Sources sections from frontmatter. |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- The detail route's dynamic segment is named `slug` in the file path (`[...slug].astro`) but is populated from `entry.id` (the collection entry's id, i.e. the markdown filename without extension) — don't confuse this with a separate `slug` frontmatter field; there isn't one.
- `ogImage` for a post is `` `/og/blog/${entry.id}.png` `` — this must match a target the catch-all OG route (`src/pages/og/[...route].png.ts`) generates automatically for every collection entry; no manual wiring needed per post.
- FAQ and Sources sections are opt-in via frontmatter (`faq`, `sources` arrays defined in `src/content.config.ts`) — omit them on a post with neither.

### Testing Requirements
- `pnpm build` must generate one static route per post with no broken links; verify a new post renders correctly with `pnpm dev` before opening a PR.
- If frontmatter includes `faq`, confirm the emitted `FAQPage` JSON-LD is well-formed (checked automatically by `pr-checks.yml` against the built `dist/` output).

### Common Patterns
- Read-time estimate and date formatting are computed inline per route rather than in a shared util — match this rather than extracting a helper for two call sites.
- The footer on every post ("Drafted by my agents, edited by me.") is a fixed string, not conditional — keep it if adding new post-detail chrome.

## Dependencies

### Internal
- Depends on the `blog` collection (`src/content.config.ts`, `src/content/blog/`) and `../../layouts/Base.astro`.

### External
- `astro:content` (`getCollection`, `render`).

<!-- MANUAL: notes below this line are preserved on regeneration -->
