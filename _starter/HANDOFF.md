# HANDOFF: the starter itself

The root `HANDOFF.md` is a **template** for projects. This file is the
starter's own state. It lives in `_starter/`, so bootstrap deletes it from
every copy along with the rest of the starter's documentation.

Status per 2026-10-08.

---

## Next Immediate Steps

1. **G4: a release used through a full cycle** in every project without a
   breaking fix or a HIGH finding. Done when every project has closed at least
   one piece of work on that release, committed with its gate green
   (agent-check included), and no session recorded the hook, agent-check,
   docs-drift or adopt blocking or passing wrongly. Checked at the dry run of
   the release after it. It counts from the release after 0.7.0, which had a
   HIGH finding: bootstrap turned off the hooks a repository already ran.
   0.5.0 had one as well: a private-agents project got no `CONTRIBUTING.md`.

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
- 2026-10-07: release 0.2.0, tagged `v0.2.0`.
- 2026-10-07: adopt brought the projects that use the starter to 0.2.0, dry
  run first. Another session adopted one of them from this folder before the
  release commit, with the same code. In each, agent-check passed 4 of 4 and a
  second dry run found nothing left to change.
- 2026-10-07: the byte order mark in adopt's import helper is an escape again,
  and a self-test invariant fails on the character (red on that file before
  the fix). adopt refuses an uncommitted source and records
  `.claude/starter-version` (7 mutations); its report names a project where no
  gate runs agent-check (4 mutations); docs-drift fails once setup is done and
  no check ran (3 mutations). Each mutation was caught by exactly the cases
  written for it. Windows 11, Node 24.13.1: `node _starter/selftest.mjs` 153
  passed, 0 failed, 0 skipped; `node tools/docs-drift.mjs` 1 passed, 2
  skipped; `node .claude/tools/agent-check.mjs` red only on the template's 67
  slots, by design.
- 2026-10-07: release 0.3.0, tagged `v0.3.0`.
- 2026-10-07: adopt brought every project that uses the starter to 0.3.0:
  `.claude/starter-version` reads `v0.3.0` in each, agent-check passed 4 of 4,
  and a second dry run found nothing left to change.
- 2026-10-07: the agnostic review, `_starter/AUDIT-2026-10-07-agnostic.md`: 15
  findings, all fixed with the owner's approval, and an HTML comment that the
  slot pattern counted as a slot. The profile checks became opt-in for a
  marked master (5 mutations) and the slot fix has 1, each caught by exactly
  the cases written for it. Windows 11, Node 24.13.1:
  `node _starter/selftest.mjs` 157 passed, 0 failed, 0 skipped;
  `node tools/docs-drift.mjs` 1 passed, 2 skipped;
  `node .claude/tools/agent-check.mjs` red only on the template's 69 slots,
  by design.
- 2026-10-07: B5 and H7 recorded as accepted limits, so no audit finding is
  open, and `AGENTS.md` §11 says plainly which tool loads are observed and
  which are only documented.
- 2026-10-07: G1. adopt brings a seeded file that is still one of the
  starter's own earlier copies up to date, with a backup, and keeps one the
  project changed (5 mutations, each caught by exactly its cases).
  `node _starter/selftest.mjs` 165 passed, 0 failed, 0 skipped;
  `node tools/docs-drift.mjs` 1 passed, 2 skipped.
- 2026-10-07: release 0.4.0, tagged `v0.4.0`: MINOR, because the commits since
  0.3.0 include a breaking fix and a feat while the starter is 0.x.
- 2026-10-07: the dry run before 0.4.0 reached any project showed adopt
  rewriting a current seeded file over its CRLF line endings. Fixed (1
  mutation, caught), and released as 0.4.1, tagged `v0.4.1`: PATCH, one fix.
  `node _starter/selftest.mjs` 166 passed, 0 failed, 0 skipped.
- 2026-10-07: adopt brought every project that uses the starter to 0.4.1, dry
  run first: `.claude/starter-version` reads `v0.4.1` in each, agent-check
  passed 4 of 4, no report line says a gate skips agent-check, and a second
  dry run found nothing left to change. Two projects got the read-only
  silent-failure-hunter through G1; the third keeps its own customised one.
- 2026-10-07: G2. A sample project, a command-line tool in Python with
  committed agent files, went from a fresh clone through every Setup step to
  its walking skeleton with the gate green, its 16 questions answered for the
  test. What it tripped on is fixed: docs-drift's post-setup guard never
  fired, because the story check runs from day one (4 mutations); one-word
  placeholders such as `<model>` passed agent-check unfilled, and bootstrap
  left the Name row to the agent (5 mutations); the Setup steps, the README
  gate and the Definition of Done now say what the run needed. Each mutation
  was caught by exactly the cases written for it. The docs-first hook blocked
  a Write given as an MSYS path in a real session, so that path needs no fix.
  Windows 11, Node 24.13.1: `node _starter/selftest.mjs` 172 passed, 0
  failed, 0 skipped; `node tools/docs-drift.mjs` 1 passed, 2 skipped;
  `node .claude/tools/agent-check.mjs` red only on the template's 70 slots,
  by design.
- 2026-10-07: G3. The public API is in `_starter/README.md`, approved by the
  owner: the commands with their flags and exit codes, what each check
  decides, the files adopt manages and where, adopt's six promises, and how
  the version moves from 1.0.0. Each claim was checked against the code
  before it was written down.
- 2026-10-07: release 0.5.0, tagged `v0.5.0`: MINOR, because the commits since
  0.4.1 include a breaking change while the starter is 0.x. CI run
  37632563737 on the release commit: 4 of 4 jobs green (Ubuntu on Node 22 and
  24, macOS and Windows on 24).
- 2026-10-07: adopt brought every project that uses the starter to 0.5.0, dry
  run first. The only change was `.claude/starter-version`, which reads
  `v0.5.0` in each; agent-check passed 4 of 4, a second dry run found nothing
  left to change, and no report line says a gate skips agent-check.
- 2026-10-07: G2 in private-agents mode. A sample team project (an HTTP API in
  Node.js, a shared team remote) went through every Setup step to its walking
  skeleton with the gate green, and a teammate's clone without agent files ran
  the `CONTRIBUTING.md` gate green. What it tripped on is fixed: no
  `CONTRIBUTING.md` existed for the people without agent files, and committed
  documents sent them to `AGENTS.md` (6 mutations); a `CONTRIBUTING.md` gate
  step missing from the `AGENTS.md` gate went unnoticed (4 mutations); the
  Copilot pointer was outside the pointer check (1 mutation).
- 2026-10-07: the brief became a form. Both trials asked seven questions about
  conventions the brief implied; `docs/BRIEF.md` is now a seven-part form whose
  conventions hold unless changed, and Setup asks once, in one message. A
  third trial on the same project, by an agent with no other context, asked 13
  questions where the free-text brief raised 19: none about conventions, ten
  about the domain and operations. What it was unsure of is settled in the
  Setup steps, and bootstrap lists `ARCHITECTURE.md` as later work (1
  mutation). Each mutation was caught by exactly the cases written for it.
  Windows 11, Node 24.13.1: `node _starter/selftest.mjs` 183 passed, 0
  failed, 0 skipped; `node tools/docs-drift.mjs` 1 passed, 3 skipped;
  `node .claude/tools/agent-check.mjs` red only on the template's 70 slots,
  by design.
- 2026-10-08: the self-test refuses to run from a git worktree. Run there, its
  copies shared the parent repository, and two fixture tags, `v9.9.9` and
  `v9.9.10`, landed in the real one; both were local only, never pushed, and
  are deleted. In a worktree it now exits 1 at once; from a full clone it runs
  as before.
- 2026-10-08: release 0.6.0, tagged `v0.6.0`: MINOR, because the commits since
  0.5.0 include a feat while the starter is 0.x. Before it, each of its nine
  commits passed the self-test and docs-drift in an isolated clone. CI run
  37671277998 on the release commit: 4 of 4 jobs green (Ubuntu on Node 22 and
  24, macOS and Windows on 24).
- 2026-10-08: adopt brought every project that uses the starter to 0.6.0, dry
  run first. The changes were `.claude/tools/agent-check.mjs`, its old copy
  backed up, and `.claude/starter-version`, which reads `v0.6.0` in each;
  agent-check passed 4 of 4, a second dry run found nothing left to change,
  and no report line says a gate skips agent-check.
- 2026-10-08: guardrails and the local gate, from the owner's update. `AGENTS.md`
  §6 and the review ladder cover server secrets in client code, queries not
  scoped to the session's owner, a browser-facing database without its
  row-level rules, and destructive down-migrations; the interface rules cover
  labels, loading states and destructive actions; the PRD has a Legal and
  privacy section. `node tools/gate.mjs` runs the gate as written, and the
  pre-push hook bootstrap wires runs it before every push, so a new project
  needs no CI service; a real push to a local remote is refused while the gate
  is red and goes through once it is green (8 mutations).
- 2026-10-08: release 0.7.0, tagged `v0.7.0`: MINOR, because the commits since
  0.6.0 include a feat while the starter is 0.x. CI run 37745022231 on the
  release commit: 4 of 4 jobs green (Ubuntu on Node 22 and 24, macOS and
  Windows on 24).
- 2026-10-08: adopt brought every project that uses the starter to 0.7.0, dry
  run first. The changes were `.claude/hooks/guard-slots.mjs`, its old copy
  backed up, and `.claude/starter-version`, which reads `v0.7.0` in each;
  agent-check passed 4 of 4, and a second dry run from a clean clone of the
  tag found nothing left to change. adopt writes neither `.githooks/` nor
  `tools/gate.mjs`: an existing project puts its gate into a pre-push hook
  itself, or keeps the hooks it already runs.
- 2026-10-08: a HIGH in 0.7.0, fixed. bootstrap set `core.hooksPath` over
  hooks that already ran: a repository's own files in `.git/hooks`, or a
  hooks path set before, by husky or a machine-wide directory, all stopped
  running without a word. It now wires `.githooks/` only where no hooks run,
  and otherwise says to add the gate to their pre-push hook. The bootstrap
  calls those cases check read no global git config, so a maintainer's own
  hooks path cannot turn the suite red. Windows 11, Node 24.13.1: 199 passed,
  0 failed; 5 of 5 mutations caught exactly.
- 2026-10-08: adopt names a kept seed that the starter changed after the
  project's recorded release, with the `git diff` to read. The review ladder
  asks each project for its own shapes, so its copy is customised and kept,
  and 0.7.0's two new CRITICAL shapes reached no project that had added one,
  with nothing to say so. The first notices come with the release after
  0.7.0: a project already on 0.7.0 is not told about those two. A recorded
  release the starter lacks gets no notice rather than a false one. Windows
  11, Node 24.13.1: 202 passed, 0 failed; 4 of 4 mutations caught exactly.

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
- 1.0.0 comes when all of these hold; until then the starter stays at 0.x,
  released by the rules of `AGENTS.md` §7 (2026-10-07):
  1. every project the starter is used in runs the current release: adopt's
     dry run finds nothing to change, `.claude/starter-version` names the
     release, and the report has no line saying no gate runs agent-check;
  2. no audit finding is open, and CI is green on Ubuntu, macOS and Windows
     for the release commit;
  3. every tool row in `AGENTS.md` §11 says observed, or says plainly why not;
  4. the starter is agnostic: it names no project it is used in, assumes no
     language or stack, and holds no preference of its owner as a rule. The
     license and copyright notices are the owner's, and stay;
  5. G1 to G4 in Next Immediate Steps are done.
- Releases and tags happen only when the owner asks, following the release
  steps in `_starter/README.md`; a pushed tag is never moved (2026-10-07).
- From 1.0.0 a version protects the public API in `_starter/README.md`
  (2026-10-07). A fix that brings a tool back to its documentation is PATCH
  even when it can turn a gate red, because the documentation is the
  contract; its changelog entry says that it can.
- G4 is measured by use, not by time (2026-10-07): time that passes without
  the release being used proves nothing.
- The brief is a form, and Setup asks once (2026-10-07): the convention
  questions both trials raised cost the owner a reply and prevented nothing.
- The starter supports harnesses, not models (2026-10-07): a model behind a
  harness changes nothing it relies on; adding a harness follows
  `_starter/README.md`.
- A project's checks run on the machine that made the change, before every
  push, not in a CI service (2026-10-08, the owner's rule for every project).
  The template's design choices stay the owner's per project: the starter
  names no colours, grid or component library, and no skill list.
- In a private-agents project, `CONTRIBUTING.md` carries the gate and the
  commit rules only (2026-10-08): the gate and CI hold the mechanical part,
  and the security rules and the Definition of Done stay with the agents in
  `AGENTS.md`, with no second copy to keep in step.
- B5 and H7 of the audit before 0.1.0 are accepted limits, not open work
  (2026-10-07); §7 of that audit gives the reasons.
- Whether Antigravity loads `AGENTS.md` natively or through the `GEMINI.md`
  import needs no further test: adopt gives every old pointer the import, so
  it loads either way, and the tested session loaded it once with both present.

## Blocked and pending

- Confirming the Gemini CLI import, and that Codex, Cursor and Copilot load
  `AGENTS.md` (§11), waits on a session in each tool. Codex and Gemini CLI
  are not installed where the starter is maintained, and no Cursor or Copilot
  session has been run there. Until one runs, §11 says documented, not yet
  observed.

## Daily commands

```bash
node _starter/selftest.mjs                         # the starter's tests: green before any commit
node _starter/mutate.mjs mutations.json            # break a fix on purpose, in copies: the right case goes red
node tools/docs-drift.mjs                          # the starter's gate, with the self-test
node .claude/tools/agent-check.mjs                 # agent config (red on template slots, by design)
node tools/adopt.mjs --into ../some-project --allow-unreleased   # verify a release candidate (dry run)
node tools/adopt.mjs --into ../some-project                      # from a release tag: dry run first
node tools/adopt.mjs --into ../some-project --apply
```
