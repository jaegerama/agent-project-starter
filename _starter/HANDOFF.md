# HANDOFF: the starter itself

The root `HANDOFF.md` is a **template** for projects. This file is the
starter's own state. It lives in `_starter/`, so bootstrap deletes it from
every copy along with the rest of the starter's documentation.

Status per 2026-10-05.

---

## Next Immediate Steps

1. Audit the starter against its own rules before the first public release.

## Done

- The starter's tools pass their self-test: `node _starter/selftest.mjs`.

## Decisions taken

- Team repositories keep agent files private (`bootstrap --private-agents`).
  adopt refuses to write a private file that git does not ignore.
- adopt never wires the docs-first hook while `AGENTS.md` has slots: in a
  project with a running session it would block real work.
- The public history starts at the import of 2026-10-05. The private history
  before it describes other private repositories and is not published.

## Blocked and pending

- Nothing.

## Daily commands

```bash
node _starter/selftest.mjs                         # the starter's tests: green before any commit
node .claude/tools/agent-check.mjs                 # agent config (red on template slots, by design)
node tools/adopt.mjs --into ../some-project        # dry run first, always
node tools/adopt.mjs --into ../some-project --apply
```
