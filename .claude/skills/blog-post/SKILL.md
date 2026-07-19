---
name: blog-post
description: Draft a technical essay in Pablo Albaladejo's editorial "Sobria authority" voice — first-person, verifiable, anchored to public code, with FAQ + sources blocks for GEO. Every claim checkable.
triggers:
  - "write an essay"
  - "write a blog post"
  - "authority essay"
  - "technical article"
  - "blog post"
  - "new blog post"
  - "add a post to the blog"
---

# blog-post — Technical essays, Pablo Albaladejo's voice

Draft a technical essay for `pabloalbaladejo.com/blog` that positions Pablo as an expert in production/agentic AI. The whole game is **authority through verifiability**: every claim is anchored to public code, real numbers, and honest limits. If a reader can't check it, it doesn't go in.

## When to use
Pablo wants a new blog essay (evals, observability, agentic development, GEO, local-first / data ownership, build-in-public). Also the source of the `/talks` abstracts, which are compressed versions of these essays.

## The voice ("Sobria authority")
- First person, plain, confident. No hype, no "in today's fast-paced world", no throat-clearing, no marketing adjectives.
- Concrete over abstract: real files, real numbers, real tradeoffs. Show the actual line (`process.exit(report.passRate >= 90 ? 0 : 1)`), not a paraphrase.
- Honest about limits — the credibility comes from saying what a thing does *not* do.
- Anti-slop: controlled em-dash use (not every sentence), no filler transitions, no invented citations, no repeated hedging. This is explicitly enforced — a prior round flagged em-dash overuse and one misattribution; a critic must catch these.

## Frontmatter contract (Astro content collection: `src/content/blog/<slug>.md`)
```yaml
---
title: "<strong claim + a concrete proof number>"   # e.g. "Evaluating LLM outputs in production: 22 benchmarks, a 90% gate"
description: "<one keyword-rich sentence — becomes meta description>"
pubDate: <YYYY-MM-DD>
category: "<UPPERCASE LABEL>"                          # e.g. "LLM EVALS", "AGENTIC DEV", "OBSERVABILITY", "GEO"
faq:                                                   # 4 Q&A → renders FAQPage JSON-LD (GEO / AI-agent answerability)
  - q: "<question a reader/agent would actually ask>"
    a: "<self-contained, machine-answerable answer, 2-4 sentences>"
  # ...4 total
sources:                                              # the verifiability backbone → each links an EXACT public file/dir
  - label: "<what this source proves>"
    href: "<https URL to the real repo file, blob, or line range>"
  # 4-6 sources, all must resolve
---
```
The page renders **two** JSON-LD blocks (Article + FAQPage) and a colophon/Related section — keep the frontmatter honest so the structured data is honest.

## Prose arc (mirror `evaluating-llm-outputs-in-production.md`)
1. **Opening paragraph** — define the thing in one crisp sentence, say why it matters in one more, then preview exactly what the piece delivers ("Below is exactly how one of these works in a system I ship, why the gate is 90% not 100%, and what I'd keep if I built it again"). No preamble.
2. **Section headers are arguments, not labels.** Good: "## The real problem: structured output you can't eyeball", "## Why 90%, not 100%", "## What the gate is actually for". Bad: "## Background", "## Implementation".
3. **Body from REAL public code.** Name the files, quote the exact numbers and the actual code line, explain the tradeoff and why it was chosen. Use bold lead-ins for the load-bearing claims.
4. **An honesty beat** — a section that states the limits plainly ("I'll be honest about what this catches and when…").
5. **"## A checklist you can lift"** — imperative, liftable bullets the reader can apply to their own system.
6. **Closing line lands the thesis in one sentence** ("The discipline isn't in the code; it's in refusing to ship structured LLM output that nothing checks.").
7. **"## Related writing"** — cross-link the other essays, each with a one-line "why read this next" that states the relationship, not just the title.

Target length ~1000–1600 words. Tight, no padding.

## Case-study rule
Use a **public** repo as the running example so everything is checkable:
- `kaiord` — evals, agentic dev, local-first, TS/hexagonal, MCP.
- `deepgent.net` — multi-tenant RAG on AWS Bedrock.
- `streaming-lambda-ai-sdk` — Bedrock+Lambda streaming/observability.
Aircall appears only for **public scale and lessons** (systems processing 1M+ transcriptions/day) — never internal feature names, dashboards, or unpublished metrics.

## Hard rules (why this skill exists)
- **Verifiability first.** Every non-obvious claim maps to a `sources` entry or an inline file reference. No claim you can't link.
- **Fresh synthesis, never reproduction.** Do NOT paste or lightly reword existing text (e.g. the dev.to series). Re-derive the argument from the real artifacts. (This was an explicit gate: "P4 is fresh synthesis, no dev.to text reproduction.")
- **Aircall: lessons, not details.** Public scale OK; internals no. Keep metric scope honest (platform "1M+ calls/day" vs a feature "10K+/day" — don't conflate to inflate).
- **Anti-slop pass.** No em-dash overuse, no filler, no fabricated or misattributed sources — verify each `href` points at the thing the `label` claims.
- **Authoring and review are separate passes.** After drafting, run an **independent critic** (a fresh code-reviewer/critic agent, not self-review). Iterate at most **2 draft→critic rounds**; if it still isn't PUBLISH-READY, escalate to Pablo rather than loop. Only ship on an explicit APPROVE.

## Delivery
- Write to `pabloalbaladejo.com/src/content/blog/<kebab-slug>.md`. The collection **auto-adds** it to `/blog`, the home Writing list, the RSS feed (`/rss.xml`), the sitemap (`@astrojs/sitemap`), and (with the OG-cards pipeline) generates its 1200×630 social card.
- **Land it as a PR** — the site's rule is agents open PRs, Pablo merges (or the lead merges with a CI-gated guarded script). `pnpm build` must be green.

## GEO / SEO propagation (MANDATORY — this is the step everyone forgets)
Writing the markdown is not "done." A new essay must be propagated to every machine-facing surface, or AI crawlers and search won't see it:
- **`public/llms.txt`** — the hand-maintained map for AI agents. Add the post under the `## Writing` section as `- [<title>](<full url>): <one-line summary>`. Keep `## Pages` current too (e.g. `/cv`, `/talks` must be listed). *(There is no `llms-full.txt` today; if one is added, update it too.)*
- **Internal link graph (bidirectional).** Add the new post to the `## Related writing` of its 2–3 sibling essays, and link back from it — a real lesson from this project was that stacked merges left the graph one-directional. Cross-links are a ranking and agent-navigation signal, not decoration.
- **Structured data** — confirm the built page emits **both** JSON-LD blocks (Article + FAQPage). The FAQ frontmatter is what feeds FAQPage; don't ship an essay with an empty/weak FAQ.
- **`sources` block** — doubles as GEO: it gives agents exact, citable artifacts. Every `href` must resolve.
- **Auto surfaces to re-verify after build**: the post is in `/rss.xml`, in the sitemap, on the home Writing list, and has an OG card at `/og/blog/<slug>.png`.
- **robots.txt** — no change per post (already allows AI crawlers); only touch if adding a new top-level section.

## Verification / success criteria
- `pnpm build` green; the post appears at `/blog/<slug>`.
- Frontmatter: 4 FAQ Q&A (self-contained), 4–6 `sources` that all resolve to real public files.
- Built page contains both JSON-LD blocks (Article + FAQPage) and the Related section.
- Independent critic verdict: **APPROVE** (≤2 iterations).
- No slop (em-dashes controlled, zero fabricated/misattributed sources); Aircall internals absent; metric scopes honest.

## Open questions to raise (don't guess)
- Which public artifact anchors the piece, and does its code actually say what the essay claims (read it, don't assume)?
- Category label and the 3 sibling essays to cross-link in "Related writing".
