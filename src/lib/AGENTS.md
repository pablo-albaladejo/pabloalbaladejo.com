<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# lib

## Purpose
Build-time helper code shared across page/endpoint components. Currently a single module that renders the site's Open Graph cards and apple-touch-icon as PNGs.

## Key Files
| File | Description |
|------|--------------|
| `og-card.ts` | Build-time-only OG image renderer. Loads static `.woff` weights (400/600/700) of Source Serif 4 from `node_modules/@fontsource/source-serif-4` (satori needs real font buffers — ttf/otf/woff, not woff2). Defines the brand palette as constants (mirrors `src/styles/global.css` light tokens: `PAPER`, `INK`, `MUTED`, `FAINT`, `ACCENT_BR`) and a tiny satori-node-shaped element builder (`el()`). Builds two visual trees: `tile(size)` (the "pa" logo lockup, reused at different sizes for the OG-card brand mark and the standalone icon) and `cardTree(headline, subtitle)` (the full 1200×630 card: brand lockup, headline sized by `headlineSize(text)` based on character count, subtitle, footer wordmark + accent bar). Renders via `satori()` → SVG → `@resvg/resvg-js` `Resvg` → PNG buffer. Exports `renderCard(headline, subtitle)`, `renderIcon()` (180×180 icon), and `truncate(text, max=120)` (word-boundary truncation with an ellipsis, used for auto-derived blog-post subtitles). |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- This module runs **only at build time** (Node, via Astro endpoints) — never import it from client-side/browser code; it reads local font files off disk with `node:fs`.
- Colors here are a **hardcoded mirror** of the light-mode tokens in `src/styles/global.css` (OG cards are always rendered light, regardless of the viewer's theme preference — there is no dark OG card). If you change the light palette in `global.css`, update the matching constants here too.
- satori requires every multi-child element to declare `display: flex` + `flexDirection` explicitly (no implicit block layout) — follow the existing `el()` calls' style shape when adding new visual elements.

### Testing Requirements
- `pnpm build` exercises every code path here (once per fixed page + once per blog post, via `src/pages/og/[...route].png.ts` and `src/pages/apple-touch-icon.png.ts`) — a font-loading or satori-tree error fails the whole build.
- After changing card layout or colors, inspect a generated PNG from `dist/og/` (or run `pnpm dev` and hit an OG route directly) to confirm it renders as intended — satori/resvg errors don't always describe visual issues.

### Common Patterns
- `headlineSize()` steps down font size at fixed character-count thresholds (24/40/54) rather than dynamic text measurement — keep new headline-length handling consistent with this simple bucketing rather than adding a measurement dependency.

## Dependencies

### Internal
- Consumed by `src/pages/og/[...route].png.ts` and `src/pages/apple-touch-icon.png.ts`.
- Color constants mirror `src/styles/global.css`.

### External
- **satori** — virtual-DOM-to-SVG renderer.
- **@resvg/resvg-js** — SVG-to-PNG rasterizer.
- **@fontsource/source-serif-4** — static `.woff` font files read directly from `node_modules`.

<!-- MANUAL: notes below this line are preserved on regeneration -->
