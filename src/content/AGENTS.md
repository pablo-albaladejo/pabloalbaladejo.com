<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# content

## Purpose
Container for Astro content collections. Currently holds a single collection, `blog`, whose loader and Zod schema are declared in `src/content.config.ts` (one level up) — this directory holds only the collection's data files.

## Key Files
None directly in this directory (schema/loader config lives in `../content.config.ts`).

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `blog/` | Markdown essays that populate the `blog` collection (see `blog/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Do not add a schema or loader file directly under `content/` — collection config lives in `src/content.config.ts` by Astro convention (the `glob` loader there points at `./src/content/blog`).
- Adding a new collection means both creating a subdirectory here (or elsewhere) for its data and registering it in `../content.config.ts`'s `collections` export.

### Testing Requirements
- `pnpm build` validates every entry in every collection against its Zod schema at build time — a schema mismatch fails the build with a specific error.

### Common Patterns
- One subdirectory per collection, named to match the collection key used in `content.config.ts` (`blog` → `content/blog/`).

## Dependencies

### Internal
- Schema/loader: `../content.config.ts`.

### External
- `astro:content` / `astro/loaders` (`glob`).

<!-- MANUAL: notes below this line are preserved on regeneration -->
