---
name: web-research
description: Use when answering questions or writing code that depends on external facts — library/SDK/API usage, versions, config keys, pricing, news, recommendations — especially when tempted to answer from memory because the topic feels well-known or the user is in a hurry. Also use when the user asks to look up, verify, or research anything, or asks for quotes, links, or sources.
---

# Web Research

## Overview

Training data is stale. If there is even a 10% chance a fact changed since training — or that you misremember it — verify on the web before asserting. If you're on the fence about whether to browse, browse. Confidence is not freshness: feeling sure you "know this stuff" is exactly when stale answers ship.

## Must-verify triggers

Verify before answering when ANY of these hold:

- Writing code against an external SDK/API/CLI, or naming versions, config keys, flags, model names, endpoints, prices, or defaults.
- Information that can change: news, releases, laws, schedules, product specs, prices, exchange rates, standards, leadership ("the CEO of X" changes).
- The user is seeking recommendations that could lead them to spend substantial time or money — products, services, tooling choices, travel, plans.
- The user wants (or would benefit from) direct quotes, links, or precise source attribution.
- A specific page, paper, dataset, or PDF is referenced and its content isn't already in context.
- Niche or emerging topic, uncertain recall, or high-stakes accuracy (medical/legal/financial — search by default).
- The user says search, verify, or look up — obey the reverse too: if they say don't browse, don't.

For news, prefer recent events and compare the publish date against the date the event happened before treating a source as current.

Time pressure ("quick", "just give me code", "you know this") does not exempt. One lookup costs seconds; a stale answer costs the user's next hour.

## Tool routing

| Need | Tool |
|---|---|
| Any research question answerable from the web (docs, versions, pricing, news, comparisons) | `codex-query "<question>"` (Bash) — first choice; runs codex's hosted search→open→find loop server-side and returns a cited answer without raw pages entering context |
| A known URL, page, or paper you must read yourself | WebFetch |
| You need to steer the loop yourself (odd sources, iterative digging) | WebSearch fan-out + WebFetch, per the manual loop below |
| Version-pinned library docs when codex-query is unavailable | context7: `resolve-library-id` → `query-docs` |
| Broad multi-source synthesis (>3 pages of your own reading) | Delegate to a subagent (or the deep-research skill) so raw pages stay out of the main context |

`codex-query` lives in this skill's `scripts/` dir (symlinked into `~/.local/bin`). It needs a logged-in codex CLI and consumes codex usage; pass one whole question as the argument, e.g. `codex-query "openai python SDK: current streaming pattern for the Responses API, with source links"`. Fire independent questions as parallel foreground Bash calls in a single message — never `run_in_background`: calls take 30–120s, and a backgrounded call tempts you to end your turn before results exist. Wait for every call's output, then synthesize. If it fails (not installed / not logged in), fall back to the manual loop.

Special cases:

- **Tool/library already used in the repo:** read the local code first — lockfile/manifest for the exact installed version — then research THAT version, not latest. Local code is the primary source for "how is this configured here."
- **Vendor product usage questions** (how to use provider X's API/product): prefer the vendor's official docs domain; don't settle claims about a product from third-party blogs.
- **Technical questions:** rely only on primary sources — official docs, release notes, source code, papers. Blog posts and Stack Overflow are leads, not evidence.

## Query craft

- Bake disambiguating task context into the query itself ("cesium terrain tile server quantized-mesh", not "tile server") — neither codex-query nor a search engine can see the conversation.
- Fan out 2–4 phrasings/angles in one parallel batch: exact error message, concept + tool name, "X vs Y", site-scoped (`site:docs.foo.com`).
- Use recency qualifiers ("2026", "latest", release names) when temporality matters.

## Manual loop: search → open → find

When steering the research yourself instead of delegating to codex-query:

1. Batch searches in parallel; never serialize queries one at a time.
2. Fetch the 2–3 most promising hits in parallel. Link-follow into the page that actually supports the claim, not the search result page.
3. Cache long pages: save fetched content under `<scratchpad>/webcache/<slug>.md`, then `rg` inside the cache instead of re-fetching or re-reading. The cache is session state — check it before fetching a URL twice.
4. Iterate with refined queries based on what you learned; stop when a round adds nothing new, or when the answer is found and (for high-stakes claims) confirmed by a second independent domain.

## Citations

- Cite claims with markdown links to the exact supporting page: `[descriptive title](https://example.com/page)`. No bare URLs, no links to search result pages.
- Place each citation next to the claim it supports — end of the sentence, after punctuation. Never inside code fences, never collected in a dump at the end.
- Each cited source must directly support the associated claim. Prefer primary and authoritative sources; use sources from different domains when the answer benefits from multiple perspectives or the claim is contested.
- Carry codex-query's citations through to the user; don't strip them. Spot-check any that look off before repeating a surprising claim.
- Say explicitly when something is your inference rather than sourced fact.

## Quoting

Paraphrase and synthesize; don't reproduce articles. Keep verbatim quotes short (a sentence or two, quoted and attributed) — long verbatim passages are a copyright problem and usually a comprehension shortcut.

## Rationalizations

| Excuse | Reality |
|---|---|
| "I know this SDK well" | Popular SDKs change fastest; memory is most stale exactly where confidence is highest. |
| "User is in a hurry" | codex-query is one Bash call. Debugging wrong code ≈ their next hour. |
| "All recent versions have this" | That claim is itself a memory claim. Verify it. |
| "This is a code task, not a facts task" | API signatures, model names, and defaults ARE temporal facts. |
| "A blog post already answered this" | Blogs go stale and copy each other. Confirm against the primary source. |
| "Searching again won't help" | Rephrase the query or scope to the official domain before giving up. |

## Red flags — stop and verify

- About to type a version number, model name, price, endpoint, or config key from memory.
- About to recommend a product, service, or plan without checking current options.
- Writing "as of my knowledge", "should work", or "recent versions".
- Citing a search-results page, or piling citations at the end of the answer.
- Answering a research-shaped question without having run codex-query or the manual loop.
