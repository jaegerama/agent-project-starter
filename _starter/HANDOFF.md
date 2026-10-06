# HANDOFF: the starter itself

The root `HANDOFF.md` is a **template** for projects. This file is the
starter's own state. It lives in `_starter/`, so bootstrap deletes it from
every copy along with the rest of the starter's documentation.

Status per 2026-10-05.

---

## Next Immediate Steps

1. ~~**Read the first CI run** of `.github/workflows/selftest.yml`.~~ **Done
   2026-10-05**: run 37326266758 on `v0.1.0`, 4 of 4 jobs green (macOS and
   Windows on Node 24, Ubuntu on 22 and 24). The step fails on any failed
   case, so each job had 0 failed; the per-job counts are in the job logs,
   which need a signed-in GitHub account to read.
2. **Confirm the Gemini CLI import once.** In a project made from the starter,
   ask a Gemini CLI session which files it loaded; mark `AGENTS.md` §11
   verified, or say what it read instead.
3. **Confirm Antigravity the same way**, and update its §11 row.
4. **Bring existing projects up to date** with `node tools/adopt.mjs --into
   ../<project>`, dry run first. Each project's own session commits what adopt
   changed there.

## Done

- 2026-10-05: the audit before the first public release,
  `_starter/AUDIT-2026-10-05.md`. Every finding was reproduced before it was
  reported and every fix mutation-checked (27 mutations, 27 caught). Windows
  11, Node 24.13.1: `node _starter/selftest.mjs` 120 passed, 0 failed, 0
  skipped; `node tools/docs-drift.mjs` 1 passed, 2 skipped;
  `node .claude/tools/agent-check.mjs` red only on the template's 67 slots,
  by design.
- 2026-10-05: the first public release, 0.1.0, tagged `v0.1.0`.
- 2026-10-06: code comments cut to the constraint they state (only comment
  lines changed, checked line by line), and every em dash rewritten: 0 left
  in the repository. No person named but the copyright holder; no project
  named. `node _starter/selftest.mjs` 120 passed, 0 failed, 0 skipped.

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

## Blocked and pending

- Nothing waits on code.

## Daily commands

```bash
node _starter/selftest.mjs                         # the starter's tests: green before any commit
node tools/docs-drift.mjs                          # the starter's gate, with the self-test
node .claude/tools/agent-check.mjs                 # agent config (red on template slots, by design)
node tools/adopt.mjs --into ../some-project        # dry run first, always
node tools/adopt.mjs --into ../some-project --apply
```
