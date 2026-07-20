---
title: "Evaluating LLM outputs in production: 22 benchmarks, a 90% gate"
description: "How I evaluate LLM outputs in production: a 22-benchmark eval harness with tiered assertions and a hard 90% CI gate that fails the build on regressions."
pubDate: 2026-07-04
category: "LLM EVALS"
faq:
  - q: "What is an LLM eval harness?"
    a: "A set of fixed input cases, a set of assertions that check each generated output against machine-verifiable expectations, and a single pass/fail gate wired into CI. It turns 'the model feels worse today' into a red build with a specific failing case and error message."
  - q: "How do you evaluate LLM outputs that aren't deterministic?"
    a: "You assert on structural properties that must hold regardless of wording — does the JSON parse against the schema, is the classification correct, is the numeric value inside a tolerance band — rather than on exact-string equality. Then you set the pass threshold below 100% so inherent variance on a few hard cases doesn't flap the build, and you keep the expensive live run on-demand while unit-testing the assertions themselves."
  - q: "Why a 90% gate instead of requiring 100% of cases to pass?"
    a: "The harness runs against a live model, and some benchmarks are deliberately ambiguous. A 100% gate on ambiguous inputs trains you to weaken your assertions until they pass, which defeats the point. 90% of 22 benchmarks means at least 20 must pass — at most 2 may fail — which is tight enough to catch a real regression and loose enough not to flap."
  - q: "Should LLM evals run on every commit?"
    a: "The assertion logic should — it's ordinary unit-tested code. The live model run usually shouldn't, because it costs money and needs an API key. I keep it as a manually triggered CI job I run deliberately, for example before swapping the model or provider, and read its exit code as the gate."
sources:
  - label: "kaiord/packages/ai/src/evals — the eval suite"
    href: "https://github.com/pablo-albaladejo/kaiord/tree/main/packages/ai/src/evals"
  - label: "benchmarks.json — the 22 curated benchmark fixtures"
    href: "https://github.com/pablo-albaladejo/kaiord/blob/main/packages/ai/src/evals/benchmarks.json"
  - label: "assertions.ts — schema, sport, step-count and ±5% zone checks"
    href: "https://github.com/pablo-albaladejo/kaiord/blob/main/packages/ai/src/evals/assertions.ts"
  - label: "run-evals.ts — the exit(passRate >= 90 ? 0 : 1) gate"
    href: "https://github.com/pablo-albaladejo/kaiord/blob/main/packages/ai/src/evals/run-evals.ts"
  - label: "eval.yml — the manually triggered CI job"
    href: "https://github.com/pablo-albaladejo/kaiord/blob/main/.github/workflows/eval.yml"
  - label: "Kaiord documentation"
    href: "https://kaiord.com/docs/"
---

An evaluation harness for production LLM output is three things: a set of fixed input cases, a set of assertions that check each generated output against machine-verifiable expectations, and a single pass/fail gate wired into CI so a regression fails the build instead of reaching users. That last part is what makes it worth building. Without a hard gate, "the model feels worse since we changed the prompt" is an argument. With one, it is a red build pointing at a specific failing case and a specific error string. Below is exactly how one of these works in a system I ship, why the gate is set at 90% rather than 100%, and what I would keep if I built it again from scratch.

## The real problem: structured output you can't eyeball

Kaiord turns a natural-language workout description — "45min sweet spot cycling: 10min warmup, 3x10min at 88-93% FTP with 2min recovery, 5min cooldown" — into a structured `Workout` object that has to be valid enough for a device to execute. The model doesn't return prose. It returns JSON that must satisfy a Zod schema: a `sport`, an ordered list of `steps`, repeat blocks with a `repeatCount` and nested children, and per-step targets like a power range in watts or a heart-rate zone in bpm.

This is the failure mode that quiet LLM regressions love. The output *reads* fine. It's syntactically JSON. But the sport flipped from cycling to running, or the model flattened a `3x` interval block into three literal steps, or it emitted a power target 15% too high. None of that is visible by skimming, and none of it survives contact with real hardware. You cannot grade this by looking at it, so the harness grades it by checking properties that must hold no matter how the model phrases the result.

## The harness: fixtures, tiered assertions, one gate

**Benchmarks are fixtures in version control.** There are 22 of them in `benchmarks.json`. Each is a small object: an input `text`, an `expectedSport`, a `minSteps`/`maxSteps` band, a `category`, a `language`, and an optional `zoneCheck`. They're deliberately spread across four sports (cycling, running, swimming, generic), across complexity (simple sessions, interval sets, repetition blocks, mixed workouts), across three language settings (English, Spanish, and mixed), and across edge cases — a 5-minute sprint, a 3-hour ride, and one input, `edge-ambiguous`, that reads "workout for tomorrow morning, something moderate" and has no expected sport at all. The spread is the point: it's a fixed, diverse slice of the input distribution that I can re-run against any model, any prompt, any provider, and compare apples to apples.

**Assertions are tiered, cheapest and hardest first.** For every benchmark, `evaluateBenchmark` runs the output through four checks:

1. **Schema validity.** The output must pass `workoutSchema.safeParse`. If it doesn't, the benchmark fails immediately and the other checks never run — a structurally invalid workout has nothing worth measuring. This is the one I treat as non-negotiable: the AGENTS.md for the suite documents it as a 100% target, and it functions as a hard short-circuit in the code.
2. **Sport correctness.** If the benchmark declares an `expectedSport`, `workout.sport` must match it. Documented target: ≥95%.
3. **Step count.** The number of steps — counting the children inside repeat blocks, not just the top level — must fall inside the benchmark's `[minSteps, maxSteps]` band. This is what catches a `3x` block that got expanded or collapsed.
4. **Zone accuracy.** When a benchmark carries a `zoneCheck`, the active steps of the right target type must have bounds within ±5% of the expected range. The tolerance is deliberate; the code comment says it plainly — it exists "to absorb AI rounding." A model that answers "88-93% FTP" with "87.5-93.2%" is correct for a human and should be correct for the gate.

Each benchmark passes only if *all* of its applicable assertions pass. Errors accumulate into a list, so a single failing case can tell you it got both the sport and the step count wrong at once.

**One numeric gate on the exit code.** The runner scores the whole suite and ends with a single line: `process.exit(report.passRate >= 90 ? 0 : 1)`. That's the gate. Ninety percent of 22 benchmarks means at least 20 must pass — the arithmetic rounds such that 19 of 22 is 86% and fails, 20 of 22 is 91% and passes. In plain terms: **at most two benchmarks may fail.** The reporter also groups results by category and by language, so a red build doesn't just say "84%" — it says the Spanish cases or the zone cases are where it broke.

## Why 90%, not 100%

Because the harness runs against a live model, and a 100% gate on a non-deterministic system with deliberately ambiguous inputs is a trap. `edge-ambiguous` — "something moderate" — has no single correct sport; demanding it pass every time would push me to weaken the assertion until it does, and a weakened assertion protects nothing. The ±5% zone tolerance already absorbs rounding on the well-specified cases. The 90% line absorbs the residual variance on the two hardest cases without hiding a real regression, because real regressions are rarely subtle: a bad schema change or a broken prompt tanks many benchmarks at once and blows straight through the threshold. A threshold you picked on purpose, and whose failure budget you can state exactly ("two of twenty-two"), is worth far more than a round 100% you'll quietly erode the first time it flakes.

## What the gate is actually for

I'll be honest about what this catches and when. The live eval is not a per-commit check — it costs tokens and needs an API key, so it lives in a workflow I trigger by hand, the way you'd run it before switching the underlying model or provider. What runs on every commit is the *assertion logic itself*, which is ordinary unit-tested code with mocked workouts; the step-counter, the zone-tolerance math, and the schema short-circuit each have tests. That split matters: the cheap, deterministic part guards the harness, and the expensive, non-deterministic part guards the model — and you decide, deliberately, when to pay for the second one.

The value shows up at exactly the moments you'd otherwise fly blind: a prompt rewrite, a model version bump, a provider swap, a schema migration. Any of those can silently move quality, and "it still looks right in the demo" is not evidence. The gate converts that anxiety into a number and a diff. When the number drops below 90, the grouped report tells me whether it was schema, sport, step count, or zones, and in which language — which is usually enough to know whether I broke the prompt or the provider changed under me.

## A checklist you can lift

If you're wiring evals around your own LLM output, this is the shape I'd reach for again:

- **Pin inputs as fixtures in version control.** A diverse, fixed set beats a large random one; you want reproducibility, not volume.
- **Assert on machine-verifiable properties, never exact strings.** Does it parse, is the class right, is the number inside a band — not "does it read well."
- **Layer assertions hardest-first and short-circuit.** If the schema fails, don't bother scoring the rest; it's noise.
- **Put a single numeric gate on the exit code and wire it to CI.** The build's green/red is the whole product.
- **Choose a threshold below 100% on purpose, and know its failure budget.** "At most two of twenty-two" is a decision; "usually passes" is not.
- **Group results so a red build says *where*.** By category, by language, by whatever axes your inputs vary along.
- **Keep the expensive live run on-demand; unit-test the assertions themselves.** Guard the harness cheaply every commit; pay for the model run when a change warrants it.
- **Include ambiguous and adversarial cases, and accept they'll flap.** They're what keeps the suite honest — and the reason the gate isn't 100%.

None of this is exotic. It's a fixtures file, a hundred lines of assertions, a reporter, and one comparison against a number. The discipline isn't in the code; it's in refusing to ship structured LLM output that nothing checks.

## Related writing

- [Shipping production software with AI agents](/blog/shipping-production-software-with-ai-agents) — the operating system around the agents that built this harness.
- [Observability for LLM pipelines](/blog/observability-for-llm-pipelines) — evals catch regressions before deploy; telemetry catches them after.
- [GEO: how AI agents find you](/blog/geo-how-ai-agents-find-you) — the discoverability side of shipping AI products.
