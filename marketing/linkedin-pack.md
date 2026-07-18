# LinkedIn pack — wave 1 (deliverable, NOT auto-published)

> Drafts for Pablo to paste manually. English by default (global technical
> audience); localize freely. One post every few days beats all at once.
> Suggested order: headline first, then P3 → P1 → P4 → P2.

## New headline

```
Senior Backend + AI Engineer · Building production software with AI agents · LLM evals & observability · Creator of Kaiord
```

## About-section opener (optional refresh)

```
I build production software with AI agents — not demos. Strict CI, specs,
published packages, real users. By day at Aircall, where my systems process
1M+ call transcriptions daily. Nights and weekends: Kaiord, an open-source
local-first training platform where every line was written by AI agents.
I write about LLM evals, observability, and agentic development at
pabloalbaladejo.com.
```

---

## P3 — Shipping production software with AI agents

**Post A (the honest hook):**
```
"Can AI agents write production code?"

Wrong question. Mine ship to npm every week. The right question is: what
stops them from shipping garbage?

In my case, four things — none of which is a better prompt:
· Specs before code
· A zero-tolerance CI gate (0 warnings, coverage thresholds)
· Conventions enforced by scripts, not memory
· Isolated worktrees + a human merge gate

I wrote up the whole operating system, with the real guard scripts and the
real failure modes: pabloalbaladejo.com/blog/shipping-production-software-with-ai-agents
```

**Post B (the confession):**
```
I don't read most of the code my AI agents write.

Before you unfollow me: I read the spec, and I trust a gate that's stricter
than any human reviewer I've worked with — zero warnings, mechanical
convention checks, coverage floors, and a merge that only I can press.

The interesting engineering isn't in the prompts. It's in the system around
them. Full write-up: pabloalbaladejo.com/blog/shipping-production-software-with-ai-agents
```

## P1 — Evaluating LLM outputs in production

**Post A (the number hook):**
```
20 of 22. That's the line between shipping and not shipping an LLM feature
in my codebase.

22 curated benchmarks, tiered assertions (schema → sport → step count →
±5% zone tolerance), and CI that exits 1 below a 90% pass rate.

Why 90% and not 100%? Because some of my benchmarks are deliberately
ambiguous — and a 100% gate on ambiguous inputs trains you to weaken your
assertions until they pass.

How I designed it: pabloalbaladejo.com/blog/evaluating-llm-outputs-in-production
```

**Post B (the contrarian):**
```
"The model feels worse since we changed the prompt" is not a bug report.

An eval harness turns that feeling into a red build with a specific failing
case. Mine is 22 benchmarks and a hard 90% CI gate — small, boring, and it
has an opinion when nobody else does.

The design decisions that matter (threshold choice, ambiguous fixtures,
what runs on every commit vs on demand):
pabloalbaladejo.com/blog/evaluating-llm-outputs-in-production
```

## P4 — Observability for LLM pipelines

**Post A (the APM gap):**
```
Your APM dashboard is lying to you about your LLM pipeline.

Request duration? The response streams — it isn't done when the handler
returns. Payload logging? That's user data you must NOT capture.

LLM observability is a different discipline: metrics deferred to stream
completion (TransformStream flush() is your friend), and telemetry schemas
where there's literally no field to leak a prompt into.

From streams to sinks, with real code:
pabloalbaladejo.com/blog/observability-for-llm-pipelines
```

**Post B (the scale lesson):**
```
At 1M+ call transcriptions a day, observability stops being a style
preference and becomes a survival rule.

The pattern that survived: telemetry as a one-method port with swappable
sinks. Start with a console sink and a ring buffer — zero infrastructure —
and name your fields after the OpenTelemetry GenAI conventions so growing
up later is an adapter, not a rewrite.

pabloalbaladejo.com/blog/observability-for-llm-pipelines
```

## P2 — GEO: how AI agents find you

**Post A (the new SEO):**
```
Your next important visitor might not be a person. It might be ChatGPT
deciding whether to cite you.

GEO (generative engine optimization) is SEO's weird new sibling: llms.txt,
robots rules for AI crawlers, structured data, markdown mirrors, registries.

I shipped all five mechanisms on kaiord.com in one day and documented every
artifact — including the rejection a maintainer handed me the same morning:
pabloalbaladejo.com/blog/geo-how-ai-agents-find-you
```

**Post B (the rejection):**
```
A maintainer rejected my open-source project from his awesome-list today.

His two reasons taught me more about distribution than any growth thread:
"below the traction bar" and "the README doesn't substantiate the
architecture." Substance AND traction. Gatekeepers weigh both.

I fixed the README the same day. The traction part? That's what the writing
is for. Full case study: pabloalbaladejo.com/blog/geo-how-ai-agents-find-you
```
