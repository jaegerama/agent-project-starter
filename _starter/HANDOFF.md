# HANDOFF: the starter itself

The root `HANDOFF.md` is a **template** for projects. This file is the
starter's own state. It lives in `_starter/`, so bootstrap deletes it from
every copy along with the rest of the starter's documentation.

Status per 2026-10-07.

---

## Next Immediate Steps

1. **Bring the remaining projects up to date** with `node tools/adopt.mjs
   --into ../<project>`, dry run first, once the owner names them. Each
   project's own session commits what adopt changed there.

## Done

- 2026-10-05: the audit before the first public release,
  `_starter/AUDIT-2026-10-05.md`. Every finding was reproduced before it was
  reported and every fix mutation-checked (27 mutations, 27 caught). Windows
  11, Node 24.13.1: `node _starter/selftest.mjs` 120 passed, 0 failed, 0
  skipped; `node tools/docs-drift.mjs` 1 passed, 2 skipped;
  `node .claude/tools/agent-check.mjs` red only on the template's 67 slots,
  by design.
- 2026-10-05: the first public release, 0.1.0, tagged `v0.1.0`.
- 2026-10-05: the first CI run of `.github/workflows/selftest.yml`, run
  37326266758 on `v0.1.0`: 4 of 4 jobs green (macOS and Windows on Node 24,
  Ubuntu on 22 and 24). The step fails on any failed case, so each job had 0
  failed; the per-job counts are in the job logs, which need a signed-in
  GitHub account to read.
- 2026-10-06: code comments cut to the constraint they state (only comment
  lines changed, checked line by line), and every em dash rewritten: 0 left
  in the repository. No person named but the copyright holder; no project
  named.
- 2026-10-06: Antigravity loads `AGENTS.md`. A fresh session in a clone loaded
  `AGENTS.md` and `GEMINI.md` as workspace rules and quoted the last sentence
  of `AGENTS.md` before using any tool. From its terminal, agent-check exited 1
  (`1 passed, 1 failed, 2 skipped of 4`, the slots, by design) and docs-drift
  exited 0.
- 2026-10-06: `tools/docs-drift.mjs` checks `make <target>` in the gate against
  the Makefile (5 cases, each mutation-checked). `review-severity.md` compared
  with ECC: no verbatim text beyond a table header, so no MIT notice is owed.
  `node _starter/selftest.mjs` 125 passed, 0 failed, 0 skipped.
- 2026-10-06: the profile check compares Antigravity's global rules,
  `~/.gemini/config/AGENTS.md`, with the master (mutation-checked).
  `node _starter/selftest.mjs` 127 passed, 0 failed, 0 skipped.
- 2026-10-07: adopt gives an old `GEMINI.md` pointer its import line (7
  mutations, each caught by exactly the cases written for it). Audit findings
  L5 and L6 closed: bootstrap drops `tools/adopt.mjs`, the last Setup step
  drops `tools/bootstrap.mjs`, and silent-failure-hunter can only read (3
  mutations, 3 caught). Windows 11, Node 24.13.1: `node _starter/selftest.mjs`
  136 passed, 0 failed, 0 skipped; `node tools/docs-drift.mjs` 1 passed, 2
  skipped; `node .claude/tools/agent-check.mjs` red only on the template's 67
  slots, by design.

## Decisions taken

- Team repositories keep agent files private (`bootstrap --private-agents`).
  adopt refuses to write a private file that git does not ignore.
- adopt never wires the docs-first hook while `AGENTS.md` has slots: in a
  project with a running session it would block real work.
- The public history starts at the import of 2026-10-05. The private history
  before it describes other private repositories and is not published.
- The owner installs skills; an agent never fetches one (`AGENTS.md` §2.1).
- The starter's `LICENSE` stays out of projects; the tool files carry its
  SPDX notice instead.
- 1.0.0 is the first version that every project runs and that someone else
  can pick up comfortably (the owner, 2026-10-07). Until then the starter
  stays at 0.x.
- Whether Antigravity loads `AGENTS.md` natively or through the `GEMINI.md`
  import needs no further test: adopt gives every old pointer the import, so
  it loads either way, and the tested session loaded it once with both present.

## Blocked and pending

- Confirming the Gemini CLI import (`AGENTS.md` §11) waits on a session in
  Gemini CLI, which is not installed where the starter is maintained. Until
  one runs, §11 says documented, not yet observed.

## Daily commands

```bash
node _starter/selftest.mjs                         # the starter's tests: green before any commit
node tools/docs-drift.mjs                          # the starter's gate, with the self-test
node .claude/tools/agent-check.mjs                 # agent config (red on template slots, by design)
node tools/adopt.mjs --into ../some-project        # dry run first, always
node tools/adopt.mjs --into ../some-project --apply
```
