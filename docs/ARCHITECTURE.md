# ARCHITECTURE: <PROJECT NAME>

Written when the second component appears. Before that, `AGENTS.md` §2–§3 is
enough.

## The parts

Each component, what it is responsible for, and what it talks to.

```
<text diagram or list of the components>
```

## Data flow

The single most important path, from request to persisted. It is what people
new to the project ask about first.

<the main path, from request to persisted>

## Decisions

Decisions **with their reason**. A decision with no reason gets reopened by the
next person, including the next session of an agent. A decision with a reason
gets reopened only when the reason stops being true, which is correct.

| # | Decision | Reason | Date | What would overturn it |
|---|---|---|---|---|
| 1 | <> | <> | <> | <the condition that makes this worth revisiting> |

A decision big enough that its **alternatives** are worth recording moves to
`docs/adr/ADR-000N-<slug>.md`.

## Boundaries that must not be crossed

For example, which layer may not import which. If something enforces it
mechanically, name the command. If nothing does yet, write "not
machine-enforced": do not let a reader assume there is a net that was never
strung.

<the boundaries, each with what enforces it>
