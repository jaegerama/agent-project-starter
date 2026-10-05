# PRD — <PROJECT NAME>

## Problem

<What is broken or expensive today, and for whom. One paragraph.>

## Users

| Role | Rough count | What they do in this system |
|---|---|---|
| <> | <> | <> |

## Core workflow — the one main job

<The single primary path this system exists to execute from input to completion.
Airbnb: book a stay. Uber: get a ride. Keep it singular and focused.>

## Scope

<A numbered list of what gets built. Each item concrete enough to be declared
done or not done.>

1. <>

## Anti-scope — what is deliberately NOT built

<This section settles more arguments than the one above it. Write the reason
too: an anti-scope item with no reason gets reopened.>

1. <> — because <>

## Definition of success

<How we know this worked. Numbers if there are any. If there are none, write
"not measured yet" — do not invent a metric.>

## Non-functional requirements

- **Security:** Zero plaintext secrets in bundles/git; server-side auth enforcement; input sanitization.
- **Performance & Budget:** Minimal RAM and storage footprint; strict zero-cost infrastructure adherence where mandated.
- **Reliability:** Graceful handling of network, timeout, or missing resource failures (fail closed on risk).

## Unverified assumptions

<What is believed true but not checked. Move it to QUESTIONS.md when it needs a
human answer.>
