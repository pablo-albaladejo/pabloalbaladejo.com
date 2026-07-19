<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# layouts

## Purpose
The single shared HTML shell for every page on the site: document head (meta, canonical, hreflang, OG/Twitter cards, sitemap/RSS links, favicon, Umami analytics), header (logo lockup, nav, theme toggle), and footer scripts (email de-obfuscation, theme persistence).

## Key Files
| File | Description |
|------|--------------|
| `Base.astro` | The one layout component every page imports. Props: `title`, `description`, `lang` (`"en"` only today), `path`, `active` (nav highlight), `ogImage` (defaults to `/og/index.png`). Contains: a no-flash inline `<script>` in `<head>` that reads `localStorage.theme` (`"light" \| "dark" \| "system"`, default `"system"`) and toggles a `.dark` class on `<html>` before first paint; full OG/Twitter meta tags; conditional Umami script tag (`PUBLIC_UMAMI_WEBSITE_ID`); a `slot="head"` for page-specific `<head>` content (JSON-LD) and a default `<slot />` for the page body; a footer script that assembles `mailto:` links from `data-email`/`data-domain`/`data-subject` attributes at runtime; a footer script wiring the header theme-toggle button (cycles System → Light → Dark, persists to `localStorage`, and re-applies on OS `prefers-color-scheme` change while set to "system"). |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- There is exactly one layout — do not create a second one without a clear reason (e.g. a fundamentally different document type); every page's visual and SEO consistency depends on all pages sharing `Base.astro`.
- The no-flash theme script and the footer theme-toggle script must stay behaviorally consistent (both read the same `localStorage` key `"theme"` and the same three-state cycle `system/light/dark`) — if you touch one, check the other.
- `lang` prop type is currently `"en"` only (no runtime enforcement of the `es` locale declared in `astro.config.mjs`) — don't assume Spanish pages work without extending this type and the layout's `hreflang` logic.

### Testing Requirements
- `pnpm build` plus a manual `pnpm dev` check of the theme toggle (all three states, both light/dark OS settings) and of an obfuscated email link (inspect the rendered `href` after JS runs) — these are runtime-script behaviors that a static build won't catch.

### Common Patterns
- Every `<meta>`/`<link>` in `<head>` derives from the `site` constant (`"https://pabloalbaladejo.com"`) plus the `path`/`ogImage` props — never hardcode the domain elsewhere in a page component.
- Inline scripts use `is:inline` (required for the no-flash script to run synchronously before paint, and used consistently for the other two scripts here) — keep that directive on any new inline `<script>` added to this file.

## Dependencies

### Internal
- Imports `../styles/global.css`.
- Consumed by every file in `src/pages/` (and `src/pages/blog/`).

### External
None beyond the browser APIs used in inline scripts (`localStorage`, `matchMedia`).

<!-- MANUAL: notes below this line are preserved on regeneration -->
