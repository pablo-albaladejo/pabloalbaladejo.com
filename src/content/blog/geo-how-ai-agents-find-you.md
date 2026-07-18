---
title: "GEO: how AI agents find you — a same-day case study"
description: "Generative engine optimization (GEO) is how AI answer engines like ChatGPT and Perplexity cite you. A same-day case study of the five mechanisms I shipped on kaiord.com — from llms.txt to registries."
pubDate: 2026-07-18
faq:
  - q: "What is GEO (generative engine optimization)?"
    a: "GEO is the practice of making a site legible and citable to AI answer engines — ChatGPT, Perplexity, Claude, Google AI Overviews — rather than only to ranked search results. In practice it means machine-readable maps (llms.txt), permissive crawler rules, structured data, plain-text/markdown mirrors of your pages, and being listed in the registries agents browse."
  - q: "What is an llms.txt file and do I need one?"
    a: "An llms.txt is a small Markdown file at your site root (see llmstxt.org) that gives an LLM a curated map of your most useful pages and documentation, plus links to full-text mirrors it can read without executing JavaScript. It doesn't replace a sitemap; it complements one. If you want AI assistants to summarize or cite your project accurately, it's the cheapest high-leverage file you can ship."
  - q: "How do I get my site cited by ChatGPT or other AI assistants?"
    a: "Make the content trivial for a crawler to read and hard to misquote: publish an llms.txt map, stop blocking the pages you want cited in robots.txt, add JSON-LD structured data and noscript text so JS-heavy apps still expose real content, mirror your docs as Markdown, and get listed in relevant registries. There's no submit button — you make yourself the easiest correct answer to find."
  - q: "Is GEO different from SEO?"
    a: "They overlap but optimize for different consumers. SEO targets a ranked list of links a human clicks; GEO targets a model that reads, synthesizes, and cites a handful of sources inside an answer. Clean HTML and sitemaps help both, but GEO leans harder on explicit maps, structured data, and plain-text mirrors because a model would rather read text than render your app."
sources:
  - label: "kaiord PR #955 — GEO groundwork: root llms.txt, robots, sitemap index, JSON-LD"
    href: "https://github.com/pablo-albaladejo/kaiord/pull/955"
  - label: "kaiord PR #956 — npm homepages point at docs, broadened keywords"
    href: "https://github.com/pablo-albaladejo/kaiord/pull/956"
  - label: "kaiord PR #962 — surface the official MCP registry listing on landing + README"
    href: "https://github.com/pablo-albaladejo/kaiord/pull/962"
  - label: "kaiord PR #965 — long-tail converter pages on the docs site"
    href: "https://github.com/pablo-albaladejo/kaiord/pull/965"
  - label: "Live artifact — kaiord.com/llms.txt"
    href: "https://kaiord.com/llms.txt"
  - label: "Live artifact — kaiord.com/docs/llms-full.txt (full Markdown corpus)"
    href: "https://kaiord.com/docs/llms-full.txt"
  - label: "Official MCP registry entry — io.github.pablo-albaladejo/kaiord"
    href: "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.pablo-albaladejo/kaiord"
  - label: "The gatekeeper lesson — awesome-local-first PR #51 (closed)"
    href: "https://github.com/alexanderop/awesome-local-first/pull/51"
---

Generative engine optimization (GEO) is how you get found by the tools that increasingly sit between people and the web: ChatGPT, Perplexity, Claude, Google's AI Overviews. Classic SEO optimizes for a ranked list of links a human clicks. GEO optimizes for a model that reads a few sources, synthesizes them, and cites the ones it trusted. The two overlap — clean HTML and a sitemap help both — but a model would rather read text than render your app, so GEO leans on five concrete mechanisms: an **llms.txt** map, **robots rules that let AI crawlers in**, **structured data**, **Markdown mirrors** of your content, and **registries** where agents and tools get indexed.

I ran that whole playbook against [kaiord.com](https://kaiord.com) — my open-source, local-first training platform — in a single day, entirely through AI agents, with me approving each pull request. This is a Day-1 report: I can show you exactly what shipped and why, mechanism by mechanism, with a link to every artifact. I can't yet show you what it earned. More on that honesty at the end.

## The five mechanisms, and the case for each

### 1. An llms.txt map ([PR #955](https://github.com/pablo-albaladejo/kaiord/pull/955))

[llms.txt](https://llmstxt.org) is a tiny Markdown file at your site root that hands an LLM a curated map of your best pages and docs. Kaiord's documentation already generated an excellent per-section `llms.txt`, but nothing at the *root* pointed agents to it — so the front door was missing. PR #955 added a root [`/llms.txt`](https://kaiord.com/llms.txt) in the llmstxt.org format: product pages in both languages, the editor, the key docs as Markdown, the full corpus, GitHub, npm. It's the cheapest high-leverage file on the whole site.

### 2. Robots rules that let AI crawlers in ([PR #955](https://github.com/pablo-albaladejo/kaiord/pull/955))

Here's the embarrassing one. The `robots.txt` had carried `Disallow: /editor/` since the original landing scaffold — meaning the *actual application*, the thing I most want cited, was invisible to every crawler and every answer engine. You can spend months on content and quietly forbid the machines from reading the best of it. The fix is one deleted line. Today [`kaiord.com/robots.txt`](https://kaiord.com/robots.txt) reads:

```
User-agent: *
Allow: /

Sitemap: https://kaiord.com/sitemap.xml

# AI agents: a curated map of this site lives at https://kaiord.com/llms.txt
# Full docs corpus in markdown: https://kaiord.com/docs/llms-full.txt
```

Lesson worth internalizing before anything else: **audit what you're already blocking before you optimize what you're not.**

### 3. Structured data ([PR #955](https://github.com/pablo-albaladejo/kaiord/pull/955), extended in [#962](https://github.com/pablo-albaladejo/kaiord/pull/962))

A single-page app is a hostile read for a crawler: an empty `<div id="root">` and a prayer. So the editor shell got a descriptive title, an accurate meta description, and — critically — `noscript` content plus a `WebApplication` JSON-LD block with a real `featureList`, so a non-JS crawler sees actual text instead of a blank frame. The landing gained a `WebSite` JSON-LD node declaring both languages, and a visible FAQ backed by `FAQPage` JSON-LD that a later PR kept in lockstep with the on-screen copy. Structured data is how you hand a machine *entities* — "this is an application, these are its features" — instead of asking it to guess from your markup.

### 4. Markdown mirrors ([PR #955](https://github.com/pablo-albaladejo/kaiord/pull/955) and [#965](https://github.com/pablo-albaladejo/kaiord/pull/965))

Models read Markdown happily and render web apps reluctantly. Kaiord's docs already emit per-page `.md` mirrors and a single [`/docs/llms-full.txt`](https://kaiord.com/docs/llms-full.txt) that concatenates the entire corpus as plain text — a model can ingest the whole product in one fetch. PR #955 also turned the root sitemap into a proper index so `/`, `/es/`, and `/editor/` are finally listed. Then [PR #965](https://github.com/pablo-albaladejo/kaiord/pull/965) added a set of long-tail converter pages ("convert FIT to ZWO", "export Zwift workout to Garmin") built on a repeatable GEO template: a direct-answer paragraph up top, three concrete ways to do the task, a grounded "what survives the conversion" table, and a couple of specific FAQs — content shaped like the questions people actually ask an assistant.

### 5. Registries ([PR #956](https://github.com/pablo-albaladejo/kaiord/pull/956) and [#962](https://github.com/pablo-albaladejo/kaiord/pull/962))

The last mechanism is showing up where agents and tools get catalogued. Two moves. First, [PR #956](https://github.com/pablo-albaladejo/kaiord/pull/956) fixed npm metadata: every package's `homepage` had linked circularly back to its own npm page, so it pointed nobody at the docs — now each points at its real docs page — and the keyword sets were broadened to the honest, high-signal terms people search (`fit-parser`, `fit-to-tcx`, `zwift-workout`, `mcp-server`). Second, [PR #962](https://github.com/pablo-albaladejo/kaiord/pull/962) surfaced that `@kaiord/mcp` is now published to the [official MCP registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.pablo-albaladejo/kaiord) as `io.github.pablo-albaladejo/kaiord` and listed on Glama — and put that where people evaluate the project: the landing's developer section, its FAQ, and the README badges. If AI agents are a distribution channel, their registries are your shelf space.

## The honest part: a gatekeeper said no

Same day, same program, one distribution move failed. I opened [awesome-local-first PR #51](https://github.com/alexanderop/awesome-local-first/pull/51) to add Kaiord to a curated list — the oldest, most human form of GEO, getting cited by a page LLMs already read. The maintainer closed it, and I want to quote the reply exactly because it's the most useful thing that happened all day:

> Thanks — this is clearly a real, actively developed project. Passing for now though: at ~7 stars it's below the traction bar for example apps, and the README doesn't really substantiate the local-first architecture (offline behavior, on-device storage as the source of truth). Happy to revisit once either of those improves.

That's a fair no, and it teaches the thing the five mechanisms can't. A technically correct PR — clean diff, accurate description, passing checks — is *necessary but not sufficient*. Human gatekeepers weigh **substance and traction**: does the README actually prove the claim, and has the project earned enough signal to be worth a slot? You can't automate your way past that. The reply even hands you the roadmap: substantiate the local-first architecture in the README, let the traction grow, and "revisit once either of those improves." I'd rather publish that no than pretend the day was flawless.

## Too early to measure

This is where I stop short of the usual case-study move. It is **Day 1**. Everything above is verifiable — the PRs are merged, the files are live, the registry entry resolves — but I have no traffic, no citation counts, and no ranking deltas to report, because none exist yet. Anyone showing you GEO "results" hours after shipping is selling something. The artifacts are the evidence; the outcomes are a measurement I'll take later. Treat the checklist below as a set of mechanisms with receipts, not a promise of numbers.

## A replicable checklist

If you want to run the same pass on your own project:

- **Ship a root `llms.txt`** in the [llmstxt.org](https://llmstxt.org) format — a curated map to your best pages, docs, and full-text mirrors.
- **Audit `robots.txt` first.** Delete any `Disallow` on pages you actually want cited; point crawlers at your sitemap and llms.txt.
- **Add JSON-LD** (`WebSite`, `WebApplication` or `Article`, `FAQPage`) and real `noscript` text for anything JavaScript-heavy, so crawlers get entities and content instead of an empty root div.
- **Mirror your docs as Markdown** — per-page `.md` files plus a single full-corpus file a model can ingest in one fetch.
- **List in the registries your audience and their agents browse** (the MCP registry, Glama, npm with honest homepages and keywords), and surface those listings on your own pages.
- **For gatekept lists, substantiate the claim in your README and be honest about traction** — expect a substance-and-traction bar, and treat a "revisit once it improves" as a roadmap, not a rejection.
