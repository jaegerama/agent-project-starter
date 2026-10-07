# PRD: <PROJECT NAME>

## Problem

<what is broken or expensive today, and for whom, in one paragraph>

## Users

| Role | Rough count | What they do in this system |
|---|---|---|
| <> | <> | <> |

## Core workflow: the one main job

The single path this system exists to execute, from input to completion. Keep
it to one: a booking site books a stay, a ride app gets you a ride.

<the one main job, from input to completion>

## Scope

What gets built, each item concrete enough to be declared done or not done.

1. <the first thing that gets built>

## Anti-scope: what is deliberately NOT built

This section settles more arguments than the one above it. Write the reason
too: an anti-scope item with no reason gets reopened.

1. <what is not built, and the reason>

## Definition of success

How we know this worked. Numbers if there are any; if there are none, write
"not measured yet". Never invent a metric.

<how success is seen>

## Non-functional requirements

Only what the brief states. One it leaves out is written "not stated", never
a default, and becomes a question in `QUESTIONS.md` only when a story depends
on it.

- **Security**: <>
- **Performance and budget**: <>
- **Reliability**: <>

## Unverified assumptions

What is believed true but not checked. Move it to `QUESTIONS.md` when it needs
a human answer.

- <an assumption, or "none yet">
