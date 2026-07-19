---
name: pablo-cfp
description: Draft conference talk proposals (CFP submissions) in Pablo Albaladejo's verifiable-claims style — every talk backed by public code and a published essay, ordered by fit with the specific event.
triggers:
  - "cfp"
  - "call for papers"
  - "talk proposal"
  - "conference proposal"
  - "sessionize"
  - "propose a talk"
  - "submit to a conference"
---

# pablo-cfp — Conference proposals, Pablo Albaladejo's way

Generate a portfolio of conference talk proposals calibrated to a specific event. The through-line that makes these land with community/committee reviewers: **every talk is backed by public code and a published essay the audience can verify.** That is the pitch, not a nice-to-have.

## When to use
Pablo is submitting to a CFP (AWS Community Day, Conf42, NDC, meetups, Sessionize-hosted events, etc.) and needs proposals that (a) fit the event's tracks, (b) are grounded in his real, public work, and (c) never overclaim.

## Inputs to gather first
- **The CFP itself**: event name, theme, tracks, audience level, allowed formats/durations, **max number of proposals**, submission fields (Sessionize field names/char limits), deadline, language.
- **Which of Pablo's assets map to it** (his verifiable proof surface):
  - `kaiord` (open-source, 9 npm packages, MCP registry, evals harness, 100% AI-coded) → agentic dev, evals, GEO, TS/hexagonal.
  - `deepgent.net` (multi-tenant RAG SaaS on AWS Bedrock) → Bedrock KB, RAG, serverless, multi-tenant.
  - `streaming-lambda-ai-sdk` + the dev.to streaming series → Bedrock + Lambda streaming, observability.
  - The 4 published essays on `pabloalbaladejo.com/blog` (evals, agents, GEO, observability).
  - Aircall (systems processing **1M+ call transcriptions/day**) → scale, production LLM ops. **Lessons and public scale only — never internal details.**

## Steps
1. **Read the CFP and map assets to tracks.** For each of the event's tracks, pick the asset(s) that give a *verifiable* talk. Discard any talk you cannot anchor to public code or a published essay.
2. **Generate up to the max allowed proposals, ordered by fit.** Do NOT pad to the max with weak ideas — order by genuine fit, and if the event is AWS/cloud-native, lead with the most AWS-native, production-story talks (they win community days). Reusable talk library to draw from and retitle per event:
   - **Observability for LLM pipelines on AWS** — the `TransformStream.flush()` deferred-telemetry trick in Lambda, telemetry-as-a-port with swappable sinks, OpenTelemetry GenAI conventions, event schemas where you *can't* leak a prompt by accident. Hardened with lessons from 1M+ transcriptions/day. Demo: Lambda emitting telemetry on stream completion (recorded fallback).
   - **Multi-tenant RAG in production with Bedrock Knowledge Bases** — Deepgent: tenant filtering, tier-aware retrieval, embeddable widget, fully serverless. Real Bedrock-in-production stories are rare in CFPs → this stands out. Demo: the live widget against deepgent.net.
   - **Evals as CI: 22 benchmarks and a 90% gate** — `@kaiord/ai`: fixtures in version control, tiered assertions, `exit(passRate >= 90 ? 0 : 1)`, why 90% not 100%. Demo: red/green build live.
   - **Production software written 100% by AI agents: the system, not the prompt** — Kaiord as verifiable proof: specs before code, zero-tolerance CI as reviewer, mechanical guards, worktrees, human gates.
   - **GEO: making your product discoverable to AI agents** (lightning) — llms.txt, robots for AI crawlers, JSON-LD, the MCP registry — with the awesome-list maintainer rejection as the honest lesson.
3. **Write each proposal to the formula** (below).
4. **Fill the reusable speaker fields** (below), adapting to the CFP's exact field names and char limits.
5. **Self-check against the constraints** (below), then present all proposals + the reusable fields, flagging the **top 2 by fit** for the case where the committee asks to prioritize.

## Per-proposal formula
- **Title**: punchy, subverts an assumption or states a strong claim. Good: "Your APM dashboard lies about your LLM pipeline", "Evals as CI: making stochastic systems boring", "Specs are the new source code". Avoid generic ("An introduction to…").
- **Format / duration / level / track**: match the CFP's options exactly.
- **Description (hit the CFP's minimum, e.g. ≥600 chars)** — three beats:
  1. **Hook** that subverts a comfortable belief ("Your dashboard tells you the response is fine — but it's streaming, so it isn't finished when the handler returns, and the payloads you'd instinctively log are exactly the ones you must not capture").
  2. **Concrete, named mechanisms** — real techniques, real tools, real file-level specifics. No hand-waving.
  3. **Close on verifiable grounding** — "all with real, open-source code, hardened with lessons from systems processing more than a million call transcriptions a day."
- **"Why this talk / why you?"** (reuse this pattern): *"Everything I present is verifiable: the code is open source, the numbers are real, and the essays are published. I don't bring toy demos — I bring the system I use in production."*
- **Demo plan + fallback**: name the live demo AND a recorded backup + "my own AWS account / internet required."

## Reusable speaker fields (adapt to char limits)
- **Tagline**: `Senior Backend + AI Engineer @ Aircall · Creator of Kaiord`
- **Bio (~300 char)**: adapt the short bio from `pabloalbaladejo.com/talks` — senior backend+AI engineer, 17+ years in SaaS, systems processing 1M+ transcriptions/day at Aircall, creator of Kaiord (open-source, every line by AI agents, official MCP registry); writes about evals, observability, agentic dev at pabloalbaladejo.com.
- **Links**: LinkedIn `linkedin.com/in/pabloalbaladejomestre` · Blog `pabloalbaladejo.com` · GitHub `github.com/pablo-albaladejo`.
- **Speaking experience — be honest, never invent conferences.** Lean on published technical writing (the 4-part dev.to streaming series, the 4 blog essays). If Pablo has given internal Aircall talks or meetups, let *him* add them. The strong, honest angle: *"every talk is backed by open-source code and published essays the audience can verify."*
- **Logistics**: Madrid-based, remote-friendly; can present in Spanish or English (note travel viability if relevant, e.g. Madrid→venue without expenses).

## Constraints / pitfalls (hard rules — these are why this skill exists)
- **Aircall: lessons, not details.** Public, attributable scale is allowed (1M+ transcriptions/day). Internal feature names, dashboards, and unpublished metrics are NOT. When a number has scope, keep the scope honest (platform "1M+ calls/day" vs a specific feature "10K+/day" — never conflate to inflate).
- **Never fabricate.** No invented conferences, audiences, or metrics. A generated mock once invented "94% accuracy / 7-point bias" for Aircall — that is exactly the trap. Only real, checkable numbers.
- **Every talk must map to a public artifact** (repo, PR, or published essay). If you can't link it, don't pitch it.
- **Order by fit, don't pad.** Sending the max allowed maximizes options, but each must be strong; note the top 2.
- **Match the event.** Retitle/reframe the same core talk per event's tracks and audience; don't submit generic copy.

## GEO / SEO propagation (don't forget)
CFP text mostly lands in the submission form + a `marketing/<event>.md` record — those don't need GEO. **But** whenever a talk abstract or the speaker bio is published/updated on the site (`/talks`), propagate it:
- **`public/llms.txt`** — keep the `## Pages` "Talks" entry and any abstract summaries current so AI agents surface the right talks.
- Confirm `/talks` still carries its structured data and that every claim links to a public artifact (same verifiability rule as the essays — see [[blog-post]]).

## Success criteria
- N ≤ max proposals, each anchored to a named public artifact, ordered by fit, top-2 flagged.
- Every description hits the CFP's char minimum and follows hook → mechanisms → verifiable-close.
- Reusable fields filled to the CFP's exact field names/limits.
- Zero fabricated conferences/metrics; zero Aircall internal details; metric scopes honest.
- Output is paste-ready into the submission form (and, if useful, saved to `marketing/<event>.md` in the relevant repo).

## Open questions to raise with Pablo (don't guess)
- Real speaking history to add (internal talks, meetups)?
- Travel/expense constraints and language preference for THIS event?
- Any asset he does NOT want public yet (e.g. an unreleased project)?
