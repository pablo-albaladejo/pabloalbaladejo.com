---
title: "Shipping production software with AI agents"
description: "Can AI agents write production code? Yes, if the system around them enforces quality mechanically. The agentic development workflow that ships production software."
pubDate: 2026-06-27
category: "AGENTIC DEV"
faq:
  - q: "Can AI agents write production code?"
    a: "Yes, when the system around them enforces quality mechanically. Specs before code, a zero-tolerance CI gate, and machine-checked conventions do the enforcing. On Kaiord every line was written by agents and it ships to npm; version 10.0.0 went out the day I published this."
  - q: "What's the hardest part of an agentic development workflow?"
    a: "Not the model — the guardrails. Agents drift without mechanical enforcement, so the work goes into turning every convention into a failing check rather than into cleverer prompts. A rule an agent can see in a red build gets followed; a rule buried in a doc gets ignored."
  - q: "Do you read the code the agents write?"
    a: "I read the spec and trust the gate. CI — zero warnings, coverage thresholds, and mechanical guards — is the line-by-line reviewer. I own intent, taste, and the merge, not the diff."
  - q: "What still needs a human?"
    a: "Approval gates, taste (is this the right thing to build), and constraints (privacy boundaries, what not to build). Agents optimize within the box; the human draws the box and presses merge."
sources:
  - label: "Kaiord — CLAUDE.md (the agent contract: quality policy, spec flow, code style)"
    href: "https://github.com/pablo-albaladejo/kaiord/blob/main/CLAUDE.md"
  - label: "Kaiord — AGENTS.md (non-negotiables, mechanical guards, CI invariants)"
    href: "https://github.com/pablo-albaladejo/kaiord/blob/main/AGENTS.md"
  - label: "Kaiord — mechanical guard scripts (scripts/check-*.mjs)"
    href: "https://github.com/pablo-albaladejo/kaiord/tree/main/scripts"
  - label: "Kaiord — test-conventions spec (R-ItTitleShould, R-ItBodyAAA)"
    href: "https://github.com/pablo-albaladejo/kaiord/blob/main/openspec/specs/test-conventions/spec.md"
  - label: "kaiord.com — landing page built entirely by AI agents"
    href: "https://kaiord.com"
  - label: "@kaiord/core 10.0.0 on npm (published 2026-07-18)"
    href: "https://www.npmjs.com/package/@kaiord/core"
  - label: "Kaiord — source repository"
    href: "https://github.com/pablo-albaladejo/kaiord"
---

The question I get asked most often is some version of "can AI agents actually write production code?" The honest answer is yes, but the caveat is the whole story. Agents can write production code **when the system around them enforces quality mechanically**. The model matters far less than the machine you put it inside. If you take one thing from this piece, take that: the interesting engineering is not the agent, it's the guardrails.

I can point at the proof. Kaiord — an open-source, local-first training platform — is built end to end by agents. Its landing page says so plainly: *"Every line — domain, adapters, editor, this page — written by AI agents."* It's a TypeScript monorepo with a domain core, format adapters, a CLI, an MCP server, and a React editor. It shipped version 10.0.0 to npm on the same day I'm publishing this, and it has more than 700 merged pull requests behind it. I wrote almost none of that code by hand. What I do is approve, set constraints, and occasionally say no. The rest is a system.

So let me describe the system honestly — including where it fails — instead of selling you the idea that a good prompt is enough. It isn't. Four pillars carry the weight.

## 1. Specs before code

Non-trivial work starts with a written spec, not a diff. In Kaiord that's the `openspec/` flow: a proposal, a design, and a task list land in `openspec/changes/<slug>/` before anyone touches an implementation file. Agents follow the tasks in a fixed hexagonal order — domain, then application, then ports, then adapters — and tick items off as they go.

This isn't ceremony. It's the cheapest failure I know how to prevent. An agent handed a vague goal will happily invent an interpretation and build it, confidently and often reasonably. But two agents handed the same vague goal will invent *two* interpretations and build both, and now you have a subtle inconsistency that no single diff review will catch. A spec is a shared contract the agents can be checked against, by me and by each other. The drift I most feared early on — plausible code that quietly disagrees with itself — is mostly designed out by making the agent commit to a plan first.

## 2. Zero-tolerance CI is the real reviewer

Kaiord's quality policy is deliberately unforgiving: zero ESLint warnings, zero TypeScript errors, zero test warnings, zero build warnings, coverage thresholds of 80% on core packages and 70% on the frontend, and a 100% test pass rate. The policy is not aspirational prose in a README; it's the CI gate, and the gate is a machine, not my patience.

This is the shift that makes agentic development tractable at volume. I do not read every line of every diff; I couldn't, and pretending otherwise would be the real risk. Instead I read the spec and trust the gate to be the line-by-line reviewer. An agent cannot argue its way past a failing test the way a tired human reviewer can be talked into "we'll fix it later." The build is red or it is green.

A candid caveat, because this is where people get burned: "green" has to mean the *whole* CI run, not the required-checks subset. Kaiord learned this the hard way. A dependency major bump renamed some type unions and quietly reddened a non-required job — the SPA model catalog — while every required check stayed green. If you gate only on the required subset, you merge a regression and call it clean. The rule that came out of it: treat any red job as red, and when a bump stales a generated artifact, regenerate the artifact rather than merging around it. Agents are excellent at chasing a gate to green; that's exactly why the gate has to cover everything you care about.

## 3. Mechanical convention guards

Conventions survive because machines enforce them, not because anyone remembers them. This is the pillar people underestimate most.

Kaiord's test suite has two structural rules that are checked, not requested. `R-ItTitleShould` requires every test title to start with the word "should." `R-ItBodyAAA` requires every test body to carry `// Arrange`, `// Act`, `// Assert` markers, in order. Both are enforced three times over — in the editor via ESLint, at commit via a pre-commit script, and again in CI. On top of that sit a fleet of `scripts/check-*.mjs` guards: one blocks toast and console calls from interpolating anything but static strings, to stop personal data leaking into logs; one forbids the state store from writing to the database directly. The 100-line-per-file, 40-line-per-function cap is an ESLint rule in the same spirit; small units keep diffs reviewable and stop agents burying a mistake in a 400-line function.

Here is the failure mode that justifies all of it, told straight. One of those guards — the one that checks the shape of a session-match identifier — exists *because two agents diverged on that identifier's format* and produced a real bug. The convention lived in a document; the agents didn't honor it; the bug shipped far enough to hurt. The fix wasn't a sterner prompt. The fix was a script that fails the build when the shape is wrong. An agent will cheerfully follow a rule it can see in a red error message and cheerfully ignore one buried three links deep in a doc. So the operating principle is blunt: if a convention matters, it is a failing check, not a paragraph. Memory is not a control; a machine is.

## 4. Isolation: worktrees and PR gates

Every change gets its own branch and its own git worktree, no exceptions, down to a one-line fix. The pre-commit hook typechecks the entire monorepo before anything is committed, so a change that breaks a package three directories away never even reaches a branch tip. And every change lands as a pull request.

Isolation is what makes the whole thing safe to run at speed. A bad agent run is contained to a branch; it can't corrupt the trunk while I'm not looking. If something slipped through, rollback is a single revert and a push, and the pipeline redeploys itself. This is the unglamorous plumbing that lets me be relaxed about letting agents move fast: the blast radius of any single mistake is one branch, and the trunk is always releasable.

## What still needs me

None of this removes the human; it relocates the human to where judgment actually lives.

**Approval gates.** Only I merge. The gate is not a keystroke, it's a decision, and it's the one thing I never delegate. Machines decide whether the code is *correct*; I decide whether it should exist.

**Taste.** Is this the right feature? Does the interaction feel right? Is the abstraction going to age well? Agents are superb at optimizing within a defined box and genuinely bad at asking whether it's the right box. That question is mine.

**Constraints.** What must this system never do? Kaiord is local-first — certain data is not supposed to leave the device, ever — and that boundary is a value judgment before it's a check. The agents optimize inside the constraints; I draw them. The recurring lesson, said plainly, is that agents are literal. They will satisfy the letter of a task and miss its intent, every time you let intent go unstated. My job is to keep stating it.

## A starter checklist

If you want to run software this way, this is the shortest honest version of what makes it work:

1. **Write conventions as failing checks, not documentation.** If a rule only lives in prose, assume it will be broken. Turn it into a lint rule or a `check-*.mjs` script that reddens the build.
2. **Make CI the reviewer, and make it merciless.** Zero warnings, real coverage thresholds, and gate on the *entire* run, not the convenient subset.
3. **Spec before code for anything non-trivial.** A short written contract prevents the confident, plausible drift that diff review won't catch.
4. **One branch and one worktree per change.** Contain the blast radius so a bad run is a revert, not an incident.
5. **Keep files and functions small.** Small units keep diffs reviewable and keep agents from burying a mistake inside a 400-line function.
6. **Make the human gate a merge, not a rubber stamp.** Delegate correctness to the machine; keep intent, taste, and the final yes for yourself.

The unfashionable truth is that "shipping production software with AI agents" is mostly a systems-design problem, not a prompting problem. The agents are capable. Whether they ship something you'd put your name on comes down to how much of your judgment you managed to encode into machines that check their work — and how honest you are about the parts you still have to do yourself.

## Related writing

- [Evaluating LLM outputs in production](/blog/evaluating-llm-outputs-in-production) — the eval gate is one of the mechanical guards this system relies on.
- [Observability for LLM pipelines](/blog/observability-for-llm-pipelines) — what production means once the agents' code is live.
- [GEO: how AI agents find you](/blog/geo-how-ai-agents-find-you) — a full day of this workflow, documented mechanism by mechanism.
