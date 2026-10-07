# TODO: <PROJECT NAME>

A story gets **one** status marker and never two. The same story under two
headings, one open and one closed, sends someone to build what already exists.

Status: `TODO` · `WIP` · `REVIEW` · `DONE` · `BLOCKED`

## Execution rules

They live in `AGENTS.md` §0.1: one story in WIP at a time, and Epic 0 first.
`node tools/docs-drift.mjs` checks both against the headings below, so keep
their shape: `### [STATUS] S<epic>.<n>: title`.

---

## Epic 0: Walking Skeleton (Harness & Verification)

### [TODO] S0.1: Scaffold minimal project & prove verification gate

**Acceptance criteria**

- [ ] Minimal project structure and runtime configuration in place
- [ ] At least one automated assertion/test runs and passes
- [ ] Full gate command exits 0 with all checks green

**Out of scope for this story:** business logic, database entities, UI styling.

---

## Epic 1: <name>

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
