<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# styles

## Purpose
Global CSS entrypoint for the whole site: Tailwind CSS 4 import, the custom `dark` variant wiring, all design tokens (light values plus `.dark` overrides) as a Tailwind `@theme` block, and hand-written typography rules for long-form blog article content (which markdown rendering can't reach with Tailwind utility classes directly).

## Key Files
| File | Description |
|------|--------------|
| `global.css` | Imports `tailwindcss` and `@fontsource-variable/source-serif-4`. Declares `@custom-variant dark (&:where(.dark, .dark *))` so `dark:` utilities key off a `.dark` class on `<html>` (set by the no-flash script in `Base.astro`) rather than `prefers-color-scheme` directly. `@theme` block: color tokens (`--color-paper`, `-surface`, `-ink`, `-body`, `-muted`, `-faint`, `-line`, `-line-2`, `-accent`, `-accent-br`, `-code-bg`, `-code-fg`, `-code-inl`, `-select`) and type tokens (`--font-serif`, `--font-mono`); a `.dark { ... }` block overrides every color token for dark mode. Base `body` styles (paper background, ink text, serif font). `.prose-article` and descendant selectors: hand-styled `h2`/`h3`/`p`/`strong`/`a`/lists/`blockquote`/`pre`/`code`/`hr` for rendered blog markdown. A block toggling which of three theme-toggle icon `<svg>`s is visible based on `data-theme-setting` on `<html>` (also set by `Base.astro`'s inline scripts). |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- **All color/type design tokens live here, in one place** (`@theme` + `.dark` override) — do not hardcode hex colors in `.astro` component styles or Tailwind arbitrary values; add/use a token instead so light/dark stays consistent.
- `src/lib/og-card.ts` mirrors the **light** token values as JS constants (satori can't read CSS) — if you change a light color token here, update those constants too.
- `.prose-article` is the only place styling markdown-rendered content (`<Content />` in `src/pages/blog/[...slug].astro`) — Tailwind utility classes can't be applied inside markdown, so new markdown element styling goes here, not as a `@tailwindcss/typography` plugin (not used in this repo).

### Testing Requirements
- `pnpm build` catches CSS syntax errors; visually verify token/typography changes with `pnpm dev` in both light and dark mode (toggle via the header button) since token overrides only show up in `.dark`.

### Common Patterns
- Token names follow a `--color-{role}` naming scheme (semantic roles like `ink`/`body`/`muted`/`faint`, not raw color names) — extend with the same scheme rather than ad hoc names.
- Dark-mode values are not simple inversions — check `.dark` block values (e.g. `--color-accent` shifts from `#b3400f` to `#f08a5d`, `--color-accent-br` stays `#e8571c` in both) before assuming a formula.

## Dependencies

### Internal
- Imported once, by `src/layouts/Base.astro`.
- Light-token values are duplicated (by necessity) in `src/lib/og-card.ts`.

### External
- **Tailwind CSS 4** (`@theme`, `@custom-variant`).
- **@fontsource-variable/source-serif-4** — variable-weight serif font import.

<!-- MANUAL: notes below this line are preserved on regeneration -->
