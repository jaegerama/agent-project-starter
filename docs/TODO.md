# TODO: <PROJECT NAME>

A story gets **one** status marker and never two. The same story under two
headings, one open and one closed, sends someone to build what already exists.

Status: `TODO` · `WIP` · `REVIEW` · `DONE` · `BLOCKED`

## Execution rules

One story in WIP at a time, and nothing past Epic 0 before it is DONE.
`node tools/docs-drift.mjs` checks both against the headings below, so keep
their shape: `### [STATUS] S<epic>.<n>: title`.

---

## Epic 0: Walking skeleton

The smallest version of the project that runs end to end, with the gate and
one passing test.

### [TODO] S0.1: Set up the smallest runnable project and prove the gate

**Acceptance criteria**

- [ ] The project's structure and runtime configuration are in place
- [ ] At least one automated test runs and passes
- [ ] `node tools/gate.mjs` exits 0, with every check green

**Out of scope for this story:** business logic, database entities, UI styling.

---

## Epic 1: <epic name>

### [TODO] S1.1: <story title>

A story is not a title, it is **acceptance criteria**. A criterion that cannot
be checked by looking at something is a wish, not a criterion.

**Acceptance criteria**

- [ ] <what can be seen / run / queried to prove it>
- [ ] <>

**Out of scope for this story:** <what is deliberately untouched, so the blast radius is explicit>

**Notes:** <decisions or traps found while doing it>

---

## Done

<Move stories here once DONE. Do not leave a copy above.>
