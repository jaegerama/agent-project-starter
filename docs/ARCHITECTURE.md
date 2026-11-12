# ARCHITECTURE: <PROJECT NAME>

Written when the second component appears. Before that, `AGENTS.md` §2–§3 is
enough. A section this project has no use for is deleted, not left empty.

## The parts

Each component, what it is responsible for, and what it talks to.

```
<text diagram or list of the components>
```

## Data flow

The single most important path, from request to persisted. It is what people
new to the project ask about first.

<the main path, from request to persisted>

## Data model

Each entity, what it belongs to, the states it moves through, and what the
database itself guarantees about it. When the schema outgrows this table, the
detail moves to `DATABASE_SCHEMA.md` and the table keeps the overview.

| Entity | Belongs to | States, and who moves it between them | What the database enforces |
|---|---|---|---|
| <> | <> | <> | <> |

## Auth and tenancy

<how a user signs in, where the server reads the user and tenant of a request from, the roles, and which layer decides each permission>

## API conventions

What every endpoint does the same way, so that no endpoint invents its own.

- **Errors**: <the shape of an error body, and which status code means what>
- **Pagination**: <cursor or offset, and the default and maximum page size>
- **Dates and amounts**: <how a timestamp and, where there is money, an amount are written in a request and a response>
- **Versioning**: <how a breaking change reaches the clients>

## Decisions

Each decision with its reason, and the condition that would make it worth
revisiting.

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
