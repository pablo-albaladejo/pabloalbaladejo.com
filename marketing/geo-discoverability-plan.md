# GEO / discoverability plan — Pablo Albaladejo

Goal: when someone asks an AI assistant a question I can credibly answer, my site or my name comes up. Written 2026-07-20. Re-measure baseline **2026-08-08 → 08-15** once GSC + Umami have data.

## Reality check (read first)
- **Today I surface via *retrieval*, not model memory.** The site is weeks old → not in most models' training data. Hits come from Perplexity, ChatGPT-with-search, Claude/Gemini browsing, and agents that read `llms.txt`. Pure "from memory" answers won't mention me yet.
- **Authority is thin.** Baseline: 0 backlinks to the site, kaiord ~7★, low npm downloads. LLMs weight multi-source corroboration; a self-owned site asserting facts about itself is weak alone. → Named + project queries work; broad topic queries don't, yet.
- Owner tags below: **[ME]** = agent/Claude can execute · **[PABLO]** = manual, only Pablo can do.

---

## A. Quick code wins (site) — high impact / low effort
- [ ] **[ME] Unify my entity / job title.** Today it's inconsistent: home + JSON-LD say *"Senior Backend + AI Engineer"*; CV says *"Senior Software Engineer & AI Architect"*. A knowledge graph wants ONE canonical `jobTitle`. **Decision needed from Pablo:** which is canonical? Then propagate across `index.astro`, `cv.astro`, `talks.astro`, and all JSON-LD.
- [ ] **[ME] Capture the misspelling in structured data.** The visible "Often misspelled Albadalejo" line was removed (tone). Re-add the capture *invisibly*: add `"Pablo Albadalejo"` (and `"Pablo Albaladejo Mestre"`) to `alternateName` in the Person/ProfilePage JSON-LD so name searches with the common typo still resolve. No visible gag.
- [ ] **[ME] `sameAs` completeness.** Ensure every profile is cross-linked in JSON-LD `sameAs` (GitHub, LinkedIn, Stack Overflow, kaiord.com, dev.to, Substack once live). This is how an LLM ties the entity together.
- [ ] **[ME] Per-page `knowsAbout` / keywords** already on home; mirror the strongest terms onto `/talks` and `/cv` JSON-LD (LLM evals, observability, agentic development, RAG, AWS Bedrock).

## B. Third-party corroboration (backlinks) — highest impact / medium effort
This is the lever that moves Tier 2/3. LLMs trust agreement across independent sources.
- [ ] **[ME] GitHub profile README** (`pablo-albaladejo/pablo-albaladejo` repo) — a crisp bio linking the site, kaiord, essays, talks. Free, high-authority, easy to draft.
- [ ] **[PABLO+ME] dev.to canonical cross-posts** of the 4 essays — publish on dev.to with `canonical_url` back to pabloalbaladejo.com (SEO-safe, no duplicate penalty). Widens reach + adds a corroborating source. [ME] preps the tagged versions; [PABLO] publishes.
- [ ] **[PABLO] LinkedIn** — update headline to the canonical title + paste the `linkedin-pack.md` posts (2–3 derived per essay). Add the site to the profile. LinkedIn is a strong entity signal.
- [ ] **[PABLO/ME] awesome-lists** — re-request kaiord in the ones that were open/rejected once traction improves (awesome-mcp-servers #10344, awesome-quantified-self #156, awesome-local-first #51). Each accepted link is durable authority.
- [ ] **[PABLO] Conference pages** — once a CFP is accepted, the conference site linking me is top-tier corroboration. (Use the `pablo-cfp` skill + `cfp-targets.md`.)
- [ ] **[PABLO] Substack** (deferred decision) — newsletter with full post + "originally published at" canonical. Another indexed source.

## C. Content depth — compounding / medium effort
- [ ] **[ME] More essays with unique framing.** Each essay is a new retrieval anchor. Best next topics (own the phrase): RAG multi-tenant on Bedrock (Deepgent), "traces before dashboards" observability deep-dive, the specs→agents operating system. Use the `blog-post` skill (includes the mandatory `llms.txt` + internal-link propagation).
- [ ] **[ME] Strengthen internal link graph** — bidirectional "Related writing" across all posts (a real GEO signal; already mostly done, verify on each new post).

## D. Measurement — required to decide what's working
- [ ] **[PABLO] Click "Verify" in Google Search Console** for pabloalbaladejo.com (TXT token already live). Then GSC shows which queries actually surface the site.
- [x] **[DONE] Umami analytics** live (`PUBLIC_UMAMI_WEBSITE_ID` wired).
- [ ] **[ME] Re-measure the baseline 2026-08-08→15**: backlinks, npm downloads, kaiord stars, and run the test battery below. Flat despite the push = structural bottleneck (need more B); moving = double down on C.

---

## Test battery — run these yourself to see if you surface
Run in **Perplexity** and **ChatGPT (search on)** — the retrieval-enabled assistants. A "hit" = my site/name/a project is cited or linked. Track pass/fail each month.

### Tier 1 — should hit (named + project)
1. `Who is Pablo Albaladejo?` → *hit: cites pabloalbaladejo.com, Aircall, Kaiord.*
2. `What is Kaiord and who made it?` → *hit: names me + kaiord.com/GitHub.*
3. `open-source local-first training platform with an MCP server for FIT/TCX files` → *hit: Kaiord surfaces.*
4. `Is Pablo Albaladejo available for conference talks?` → *hit: /talks.*

### Tier 2 — aspirational with retrieval (my framing)
5. `example of an LLM eval harness with a 90% pass gate in CI` → *hit: my evals essay.*
6. `how do I make my product/repo discoverable to AI agents? (llms.txt, GEO)` → *hit: my GEO essay.*
7. `how to add observability to an LLM pipeline on AWS Lambda` → *hit: my observability essay.*
8. `real-world example of production software written entirely by AI agents` → *hit: Kaiord / my agents essay.*

### Tier 3 — the dream (hard today)
9. `AI engineer in Madrid experienced with AWS Bedrock, LLM evals and agentic development` → *hit: my name/site.*
10. `who writes about treating LLM evals as CI?` → *hit: my name/essay.*

**Scoring:** Tier 1 all hitting = the entity is legible (good). Tier 2 starting to hit = corroboration (B) is landing. Tier 3 hitting = you've arrived. Record results with dates; the delta month-over-month is the signal, not any single run (LLM answers are non-deterministic — run each 2–3×).

---

## Suggested order
1. **This week — [ME], after Pablo picks the canonical title:** A (entity unify, alternateName typo, sameAs) + GitHub README. Cheap, immediate.
2. **Ongoing — [PABLO]:** GSC Verify, LinkedIn headline+posts, dev.to cross-posts.
3. **Aug 8–15:** re-measure + run the battery; decide B vs C emphasis from the data.
