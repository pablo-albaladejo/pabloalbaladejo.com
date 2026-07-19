<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# blog

## Purpose
The `blog` content collection's data: markdown essays about LLM evaluation, agentic development, and observability, each with structured frontmatter (FAQ + sources) that feeds JSON-LD (`Article`/`FAQPage`) on the rendered post page.

## Key Files
| File | Description |
|------|--------------|
| `.gitkeep` | Keeps the directory tracked in git independent of content (empty placeholder). |
| `evaluating-llm-outputs-in-production.md` | "Evaluating LLM outputs in production: 22 benchmarks, a 90% gate" — an LLM eval-harness case study grounded in Kaiord's evals suite; `category: "LLM EVALS"`, 4 FAQ entries, sourced links into `kaiord`'s GitHub repo and docs. |
| `geo-how-ai-agents-find-you.md` | GEO (Generative Engine Optimization) case study on optimizing kaiord.com for AI answer engines. |
| `observability-for-llm-pipelines.md` | Observability practices for LLM pipelines — streaming metrics, telemetry as a swappable sink. |
| `shipping-production-software-with-ai-agents.md` | The operating model for shipping production code with AI agents — specs, zero-tolerance CI, mechanical guards, isolated worktrees. |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- Every file must satisfy the Zod schema in `src/content.config.ts`: `title` (string, **max 65 chars** — schema-enforced), `description` (string), `pubDate` (coercible to `Date`, e.g. `2026-07-18`), optional `category` (string), optional `faq` (array of `{q, a}`), optional `sources` (array of `{label, href}`).
- The filename (minus extension) becomes the post's `id`/URL slug (`/blog/{filename}`) and its OG-card route (`/og/blog/{filename}.png`) — choose filenames deliberately; renaming a published post changes its live URL.
- **After adding a new post here, add a matching entry to `public/llms.txt`** under "Writing" — this is the one GEO surface not generated automatically from the collection (sitemap, RSS, and the OG card are automatic).
- Sources cited in frontmatter should be real, checkable links (this repo's own writing convention leans heavily on "every claim links to a verifiable artifact" — see `src/pages/blog/index.astro`'s page description) — don't add placeholder/unverified sources.

### Testing Requirements
- `pnpm build` validates every file's frontmatter against the Zod schema — a missing required field or an oversized `title` fails the build with a specific error pointing at the file.
- If the post has `faq`, verify the emitted `FAQPage` JSON-LD is well-formed (checked automatically by `pr-checks.yml` against the built HTML).

### Common Patterns
- Posts open with a short, direct paragraph stating the concrete problem before any framing/preamble (see the opening of `evaluating-llm-outputs-in-production.md`) — match this house style for new essays rather than a generic intro.
- `category` values are short, all-caps topical tags (e.g. `"LLM EVALS"`) rendered as an accent-colored label on the post page.

## Dependencies

### Internal
- Schema/loader: `../../content.config.ts`. Rendered by `src/pages/blog/index.astro` and `src/pages/blog/[...slug].astro`. Must stay in sync with `public/llms.txt`.

### External
None (plain markdown, parsed by Astro's built-in content pipeline).

<!-- MANUAL: notes below this line are preserved on regeneration -->
