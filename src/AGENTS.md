<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# src

## Purpose
Astro application source for pabloalbaladejo.com: file-based routes (pages), the shared HTML shell (layouts), the blog content collection and its schema, build-time helpers (OG card rendering), and global CSS/design tokens. Everything under `src/` is compiled by `astro build` into static HTML/CSS/JS in `dist/`.

## Key Files
| File | Description |
|------|--------------|
| `content.config.ts` | Defines the `blog` content collection: a `glob` loader over `src/content/blog/**/*.{md,mdx}` and a Zod schema (`title` ≤65 chars, `description`, `pubDate`, optional `category`, optional `faq[]`, optional `sources[]`). |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `pages/` | File-based routes: static pages, the blog index/detail routes, and API-style build-time endpoints (RSS, OG images, favicon) (see `pages/_AGENTS.md` — underscore-prefixed so Astro's router doesn't build it as a live page). |
| `layouts/` | Shared HTML shell (`Base.astro`) — head/meta, header/nav, theme toggle, email de-obfuscation (see `layouts/AGENTS.md`). |
| `content/` | The `blog` content collection — markdown essays plus the loader config above (see `content/AGENTS.md`). |
| `lib/` | Build-time helper code shared across pages — currently the OG-card/icon renderer (see `lib/AGENTS.md`). |
| `styles/` | Global CSS: Tailwind entrypoint, design tokens (light/dark), long-form article typography (see `styles/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Astro components (`.astro`) mix a frontmatter script block (fenced by `---`) with an HTML-like template; imports and data-fetching (e.g. `getCollection`) happen in the frontmatter.
- All page components import and wrap their content in `Base.astro`, passing `title`, `description`, `path`, and usually `ogImage`/`active`.
- TypeScript is strict (`astro/tsconfigs/strict` via the root `tsconfig.json`) — type page props and loader return values explicitly.

### Testing Requirements
- `pnpm build` from the repo root is the only gate; there are no unit tests for `src/`. A successful build means every route rendered, every collection entry validated against its Zod schema, and every OG-image static path resolved.
- Visually verify page changes with `pnpm dev` (Astro dev server) before opening a PR — there's no visual regression tooling.

### Common Patterns
- New pages: create a `.astro` file under `pages/`, wrap the body in `<Base>` with a unique `path` (used for canonical URL, hreflang, and OG lookup) and an `ogImage` pointing at the matching route under `pages/og/`.
- New blog content is markdown in `content/blog/`, not a new page — routing for individual posts and the index is already handled by `pages/blog/`.
- Structured data (JSON-LD) is inlined per-page as `<script type="application/ld+json" set:html={...} slot="head" />`, injected into `Base.astro`'s `<head>` via the named slot.

## Dependencies

### Internal
- `pages/` depends on `layouts/Base.astro`, `content/` (via `astro:content`), and `lib/og-card.ts`.
- `layouts/Base.astro` depends on `styles/global.css`.

### External
- `astro:content` (Astro's built-in content-collections API) for the blog loader/schema.
- Zod (bundled with Astro) for the blog frontmatter schema.

<!-- MANUAL: notes below this line are preserved on regeneration -->
