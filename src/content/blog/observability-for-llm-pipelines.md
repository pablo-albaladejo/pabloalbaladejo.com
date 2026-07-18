---
title: "Observability for LLM pipelines: from streams to sinks"
description: "A practical guide to LLM observability: how to monitor LLM pipelines in production when classic APM misses streaming and agents — telemetry as a swappable sink, deferred-flush metrics, and real code."
pubDate: 2026-07-18
category: "OBSERVABILITY"
faq:
  - q: "How is LLM observability different from normal APM?"
    a: "Classic APM measures the request/response lifecycle: span duration, p99 latency, error rate. Two things break that model for LLMs. First, the call streams, so the response isn't finished when the HTTP response returns — the signals you actually want (total tokens, finish reason, end-to-end latency) only exist after the last chunk. Second, the payloads you'd instinctively log — prompts and completions — are exactly the ones you must not, because they carry user data. LLM observability is about capturing identifiers, versions and metrics, deferred to stream completion, behind an interface you can swap."
  - q: "How do I observe a streaming response if the metrics only exist at the end?"
    a: "Don't try to attach observability to the handler's return — for a streamed body it fires before the client has consumed the stream. Wrap the stream in a WHATWG TransformStream and emit your telemetry in the flush() callback, which runs exactly once after the last chunk passes through. You accumulate counts as chunks flow and emit the complete picture at the end."
  - q: "How do I keep user data and PII out of LLM telemetry?"
    a: "Make payload capture impossible rather than optional. Define a small, closed event set whose fields are only identifiers, versions and metrics — trace id, agent and prompt versions, provider, model, latency, token counts — with no field that can hold prompt or completion text. If there's nowhere to put the bytes, no one leaks them by accident."
  - q: "Do I need OpenTelemetry to start?"
    a: "No. Start with a console sink and an in-memory ring-buffer sink behind a one-method port, which is zero infrastructure. Name your fields to match the OpenTelemetry GenAI semantic conventions so that adding a real exporter later is a new adapter, not a rewrite of the pipeline."
sources:
  - label: "streaming-lambda-ai-sdk — deferred observability via TransformStream flush() (GitHub)"
    href: "https://github.com/pablo-albaladejo/streaming-lambda-ai-sdk"
  - label: "Observable AI Streaming on AWS — Part 1: API Gateway REST with Lambda (dev.to series)"
    href: "https://dev.to/pabloalbaladejo/observable-ai-streaming-on-aws-part-1-api-gateway-rest-with-lambda-595a"
  - label: "Observable AI Streaming on AWS — Part 3: The TransformStream Pipeline (dev.to)"
    href: "https://dev.to/pabloalbaladejo/observable-ai-streaming-on-aws-part-3-the-transformstream-pipeline-4p4j"
  - label: "Kaiord AI telemetry sinks — noop / console / ring-buffer behind one port (GitHub)"
    href: "https://github.com/pablo-albaladejo/kaiord/tree/main/packages/ai/src/observability"
  - label: "OpenTelemetry GenAI semantic conventions"
    href: "https://opentelemetry.io/docs/specs/semconv/gen-ai/"
---

Observability for an LLM pipeline is the ability to answer, after the fact and in aggregate, what your model actually did: which prompt and model version ran, how long it took, how many tokens it burned, and whether it failed and why — **without ever capturing the user's text or the model's output**. That last clause is why you can't just point your existing monitoring at it.

Classic APM assumes a request comes in, work happens, a response goes out, and you measure the gap. LLM pipelines violate that assumption in two structural ways. They stream, so the "response" isn't done when the HTTP response is — the interesting signal only exists after the last chunk. And the payloads you'd instinctively log are exactly the ones you're not allowed to keep. So the discipline becomes: capture identifiers, versions and metrics; defer the emission until the stream completes; and route it all through an interface you can swap without touching the pipeline.

I've built this three times now, at three very different scales, and the same shape keeps emerging. Here are the three artifacts that taught it to me.

## Artifact one: streaming, and the flush() trick

The first place the classic model breaks is AWS Lambda streaming a structured response from Bedrock. I wrote this up as an open-source reference, [streaming-lambda-ai-sdk](https://github.com/pablo-albaladejo/streaming-lambda-ai-sdk), with a [four-part companion series](https://dev.to/pabloalbaladejo/observable-ai-streaming-on-aws-part-1-api-gateway-rest-with-lambda-595a) walking through it — I'll summarise the observability idea here rather than repeat the series.

The instinct is to attach logging and metrics to a middleware "after" hook — Middy has one, most frameworks do. It doesn't work for a streamed body. The after hook fires when the handler returns the stream, not when the client finishes reading it, so anything you compute there sees an empty or half-filled picture. Token counts, finish reason, total latency: none of them exist yet.

The fix is to move the observation point to where the data genuinely ends. You wrap the outgoing stream in a WHATWG `TransformStream`, accumulate what you need as chunks flow through `transform()`, and emit telemetry from the [`flush()` callback](https://dev.to/pabloalbaladejo/observable-ai-streaming-on-aws-part-3-the-transformstream-pipeline-4p4j) — which the runtime invokes exactly once, after the last chunk has passed. The metrics that only exist at the end get emitted at the end. Deferred observability, in one well-placed callback.

The lesson generalises past Lambda: **for anything streamed, the emission point is the flush, not the return.** Design for that and the rest of your telemetry falls into place.

## Artifact two: agent telemetry as a port

The second artifact is the telemetry layer inside [Kaiord's AI package](https://github.com/pablo-albaladejo/kaiord/tree/main/packages/ai/src/observability), which runs a small fleet of agents. Here the streaming detail matters less than the shape of the seam — and that seam is deliberately boring: telemetry is a **port**, one method wide.

```ts
export type AiTelemetrySink = {
  emit: (event: AiTelemetryEvent) => void;
};
```

The runtime holds a sink and calls `emit` when a run ends. It never knows or cares where the event goes. What it emits is a closed union of exactly two shapes:

```ts
export type AiTelemetryEvent =
  | ({ type: "run_finished"; usage?: AiUsage } & RunIdentity)
  | ({ type: "run_failed";
       error: { name: string; retriable: boolean } } & RunIdentity);
```

Every event carries the same `RunIdentity`: a trace id, the agent id and version, the prompt id and version, the provider string, the model id, the run's purpose, and the latency in milliseconds. A finished run may add token `usage`; a failed run adds an error with a name and a `retriable` flag. And that's the whole vocabulary.

Notice what's *not* in there. There is no field for the prompt, no field for the completion, no field for document bytes, no field for API keys. As the source comment puts it, the two event shapes "make payload capture impossible rather than optional." You can't leak what you gave yourself nowhere to store. The field names are also chosen to map cleanly onto the [OpenTelemetry GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) — `provider` lines up with `gen_ai.system`, for instance — without taking on an OTel dependency you don't need yet.

Behind that one-method port sit three implementations, and the differences are the whole point:

- **`createNoopTelemetrySink`** does nothing. It's the default, so callers never have to branch on whether a sink is present — an unconfigured runtime still runs, it just observes nothing.
- **`createConsoleTelemetrySink`** logs one summary line per run (`[ai:run_finished] planner@3 anthropic.messages/… purpose=chat 812ms`). Because it carries ids and metrics only, it's safe to leave enabled anywhere.
- **`createRingBufferTelemetrySink`** keeps the last N events in memory. The deterministic eval lane and the tests use it to assert that a given run emitted `run_finished` with the expected ids — observability as a testable property, not a hope.

Swapping console for a real exporter is one new file that implements `emit`. The pipeline that produces the events doesn't move a line.

## Artifact three: what scale taught me

The third artifact I can't hand you the source to, but it's where these patterns were forged under load. At Aircall, where my systems process 1M+ call transcriptions a day, a few things stopped being style preferences and became survival rules:

- **Instrument before you scale, not after.** Retrofitting observability onto a hot path is a migration with a rollout plan. Building the seam in from the first version is a line of code. The cost asymmetry is enormous, and it's paid entirely up front for almost nothing.
- **Telemetry belongs behind an interface.** Volume eventually forces you to change *where* signals land — a console line becomes an aggregator, an aggregator becomes a sampled pipeline. If that "where" is a swappable sink, you change the sink; if it's threaded through the business logic, you change everything.
- **Streaming redefines "done."** You cannot wait for the full response to observe it, so the emission point has to be the end of the stream. This is the flush trick again, and at high throughput it's the difference between real numbers and blanks.
- **Sampling versus completeness is a genuine tradeoff.** Cheap counters and metrics you keep for every event; heavier, richer traces you sample. Deciding that per event type, deliberately and early, keeps cost bounded without going blind.

None of that requires knowing anything about a specific stack. They're the general patterns that survive contact with real traffic.

## A pragmatic adoption path

You don't need a platform team or a tracing backend to start. In order:

1. **Define the event set first.** Two shapes — finished and failed — carrying only ids, versions and metrics. If a reviewer can't find a field that could hold prompt or completion text, you've done it right.
2. **Start with a ring buffer plus a console sink.** The ring buffer lets your tests assert what got emitted; the console sink gives you eyes in development. Zero infrastructure, and you learn the shape of your own telemetry immediately.
3. **Default the port to a no-op.** Production without a configured sink should run fine and observe nothing, so nobody has to guard every call site.
4. **Graduate to a real sink when you need one.** An OTel exporter, a metrics backend, your log pipeline — each is a single adapter behind the same `emit`. The pipeline never notices.
5. **Put the emission at the flush for anything streamed.** It's the one place the numbers are actually complete.

Observability for LLM pipelines isn't a product you buy or a dashboard you stand up on day one. It's a seam you build early — a one-method port, a closed event set, and a flush in the right place — so that the day traffic arrives, you already know what your models are doing.

## Related writing

- [Evaluating LLM outputs in production](/blog/evaluating-llm-outputs-in-production) — the pre-deploy counterpart: evals gate what telemetry later observes.
- [Shipping production software with AI agents](/blog/shipping-production-software-with-ai-agents) — the system that produced the telemetry port described here.
- [GEO: how AI agents find you](/blog/geo-how-ai-agents-find-you) — making the systems you observe discoverable too.
