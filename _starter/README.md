# About this starter

This folder holds the starter's own guide, state and tests: how the starter
is built, what each release promises, and how it is changed and released. It
is written for people who maintain the starter or bring it into existing
projects; to start a project, read the [README](../README.md) at the root
first. `bootstrap` deletes this folder from every new project, so nothing in
it becomes part of a project.

---

## A new project: bootstrap

A new project follows the Setup section at the top of `AGENTS.md`, and the
owner's part is the brief in `docs/BRIEF.md`. Step 2 of Setup runs
`node tools/bootstrap.mjs`, which does the mechanical part:

- Replaces `<PROJECT NAME>` in the templates with the project's name.
- Writes `README.md`, `CHANGELOG.md` and `HANDOFF.md` from `templates/` over
  the starter's own README and changelog.
- Deletes what else belongs to the starter: this folder, `LICENSE`, the
  self-test workflow with the `.github/workflows/` folder it leaves empty, and
  `tools/adopt.mjs`.
- Starts a fresh git history when the copy carries the starter's own. A copy
  made in a file manager includes the hidden `.git` folder, and without the
  reset a private-agents project would push `AGENTS.md` and `.claude/` on its
  first push.
- With `--private-agents`, appends the block to `.gitignore` that keeps the
  agent files out of git, and writes `CONTRIBUTING.md` from `templates/` for
  the people who do not have those files.
- Points git at `.githooks/`, whose pre-push hook runs the gate before every
  push, so the project needs no CI service. Where hooks already run, in
  `.git/hooks` or through a `core.hooksPath` set earlier, it leaves them alone
  and says to add the gate to their pre-push hook instead.
- Lists the slots still to fill.

Without `--apply` it is a dry run that changes nothing. It refuses to run in a
folder named `project-starter` or `agent-project-starter`, so the starter
itself is never taken apart.

In Claude Code, the hook `.claude/hooks/guard-slots.mjs` refuses Write, Edit
and NotebookEdit on application code while `AGENTS.md` has empty slots; a file
written through the shell does not reach it. The other tools have no such
hook, so there the rule depends on the gate.

## An existing project, or an update: adopt

```bash
node tools/adopt.mjs --into ../some-project           # dry run: changes nothing
node tools/adopt.mjs --into ../some-project --apply
```

Run it from the starter, the first time and after every release. The files
it manages and what it promises are sections 3 and 4 of the public API below.
The step-by-step update for a user is in the
[README](../README.md#bring-in-an-existing-project-or-update-one).

## Two modes: committed and private

| | Committed (default) | Private (`--private-agents`) |
|---|---|---|
| For | A personal or local repository | A repository pushed to a shared team remote |
| `AGENTS.md`, pointers, `.claude/` | Committed, so they travel with every clone | Listed in `.gitignore`, so they stay on this machine |
| Rules people need | `AGENTS.md` | `CONTRIBUTING.md` and `docs/`, which are committed |
| The gate a person can see | Section 4 of `AGENTS.md` | `CONTRIBUTING.md`; docs-drift fails when it runs a command the `AGENTS.md` gate lacks |

Private mode is for team repositories whose owners keep agent configuration
per developer: a team remote must never receive it. In that mode git cannot
restore the agent files, which is why adopt backs them up before it changes
anything.

---

## Why one `AGENTS.md`, and pointers

Every rule lives in `AGENTS.md`. A tool that reads another file gets a pointer
to it; section 11 of `AGENTS.md` lists them. Several files holding the same
rules would be several sources of truth drifting apart, the exact defect the
checks were built to catch, and a pointer cannot drift, because it holds no
rules. The second check in `.claude/tools/agent-check.mjs` keeps it so: a
pointer that grows past 60 lines or stops naming `AGENTS.md` fails the gate,
and so does a `CLAUDE.md` whose `@AGENTS.md` import is missing or sits inside
code.

### Adding an agent harness

Section 11 of `AGENTS.md` says how to add a harness to a project. In the
starter, a new pointer file also joins `POINTERS` in
`.claude/tools/agent-check.mjs` and, since it is an agent file, the private
block in `tools/bootstrap.mjs`.

---

## What this starter does not carry

It carries the process. It cannot carry the part of a mature project's
quality that builds up over time instead of being configured:

- The tests the gate runs. The pre-push hook stops a push when the gate
  fails, but on day one there is nothing to test.
- Checks that read the code and the documents and fail when they disagree.
  There is no code yet for them to read.
- The notes that explain why each rule exists, each one written after
  something went wrong.

Those take weeks. They start with Setup step 7, the first check that compares
a document with code, and with the reasons section 4 of `AGENTS.md` asks you
to write down as you learn them.

The failure this is meant to prevent is a project that quotes all these
rules, has none of the enforcement, and lets everyone relax against a safety
net nobody built. A document keeps stating what the code stopped doing until a
check reads it. So when something in a project is an aim rather than a
mechanism, mark it as an aim until it becomes one.

---

## What is in this directory

| File | What it holds |
|---|---|
| `README.md` | This guide |
| `HANDOFF.md` | The starter's own state and next steps |
| `selftest.mjs` | The starter's tests: `node _starter/selftest.mjs` must pass before every commit |
| `mutate.mjs` | Breaks a fix on purpose in a throwaway copy and reports which tests failed: `node _starter/mutate.mjs mutations.json` |
| `operator-profile.md` | An example operator profile: what one is, where each tool reads it, and how its copies are kept identical |
| `templates/` | The `README.md`, `CHANGELOG.md` and `HANDOFF.md` a new project starts with, and the `CONTRIBUTING.md` bootstrap writes for a private-agents project. They wait here because the starter's root holds its own README and changelog |

The starter's release history is `CHANGELOG.md`, at the root.

---

## Public API: what a version number protects

From 1.0.0 the starter's version follows Semantic Versioning over the four
groups below. Everything else can change in any release: the wording of
messages, the self-test, the starter's own documents, and the prose of the
templates a new project fills.

### 1. Commands, flags and exit codes

| Command | Run from | Flags | Exit |
|---|---|---|---|
| `node tools/bootstrap.mjs` | a new copy | `--name`, `--private-agents`, `--apply` | 0 done or dry run; 1 refused |
| `node tools/adopt.mjs` | the starter | `--into`, `--apply`, `--allow-unreleased`, `--allow-dirty` | 0 done or dry run; 1 refused |
| `node .claude/tools/agent-check.mjs` | the project root | none | 0 no check failed; 1 one did |
| `node tools/docs-drift.mjs` | the project root | none | 0 no check failed; 1 one did, or setup is done and no check compared a document with code |
| `node tools/gate.mjs` | the project root, or a pre-push hook | none | 0 every line of the gate passed; else the first failing line's exit code, or 1 with no gate to run |
| `.claude/hooks/guard-slots.mjs` | Claude Code, as a PreToolUse hook | JSON on stdin | 0 allow; 2 block |

The `/gate` and `/docs-drift` commands and the `silent-failure-hunter` agent
keep their names.

### 2. What the checks decide

- **An unfilled slot** is what `.claude/tools/lib/slot.mjs` matches: the named
  form and the empty forms its comments list.
- **A pointer** is a `CLAUDE.md`, `GEMINI.md` or
  `.github/copilot-instructions.md` of at most 60 lines that names
  `AGENTS.md`. `CLAUDE.md` also imports it, with `@AGENTS.md` on a line of its
  own outside code.
- **A story** is a heading `### [STATUS] S<epic>.<n>: title` in
  `docs/TODO.md`, with STATUS one of TODO, WIP, REVIEW, DONE, BLOCKED. One
  story is in WIP at a time, and nothing past Epic 0 starts before Epic 0 is
  DONE.
- **Setup is done** when `AGENTS.md` has no heading that starts `## Setup`.
- **The gates**: every command of the `CONTRIBUTING.md` gate is also in the
  `AGENTS.md` gate, where both have one.
- **The operator profile** opts in with a master that carries
  `<!-- operator-profile -->`; a shared block is marked
  `<!-- name:start -->` … `<!-- name:end -->`.

### 3. The files adopt manages, and where they live

| | Files | What adopt does |
|---|---|---|
| Owned | `.claude/tools/agent-check.mjs`, `.claude/tools/lib/slot.mjs`, `.claude/tools/lib/pointer.mjs`, `.claude/hooks/guard-slots.mjs` | Replaces them, after backing up the old copy |
| Seeded | `.claude/rules/review-severity.md`, `.claude/commands/gate.md`, `.claude/commands/docs-drift.md`, `.claude/agents/silent-failure-hunter.md`, `GEMINI.md`, `.github/copilot-instructions.md`; in committed mode also `CHANGELOG.md`, `tools/docs-drift.mjs` and `tools/gate.mjs` | Copies a missing one; updates one only while it equals one of the starter's own earlier versions |
| Seeded once | `HANDOFF.md`, in committed mode | Copies it where the project has none at the root or under `docs/`; never updates it |
| Pointers | `CLAUDE.md`, `GEMINI.md` | Adds `CLAUDE.md` where it is missing, and the import line, just after the title, to a pointer that lacks one |
| Wired | `.claude/settings.json`: the PreToolUse entry `node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-slots.mjs"` on `Write\|Edit\|NotebookEdit` | Adds it once `AGENTS.md` has no slots |
| Recorded | `.claude/starter-version`: one line, `vX.Y.Z`, or `vX.Y.Z+<commit>` with `-dirty` when the starter was not at a release | Writes it on every apply from a git checkout of the starter |
| Backups | `.claude.backup-adopt-<stamp>/` | Writes one per apply that replaces anything |
| Private mode | The `.gitignore` block bootstrap appends, which starts `# agent files: private (bootstrap --private-agents)` | Refuses to write a private file that git does not ignore |

### 4. What adopt promises

1. Without `--apply` it writes nothing.
2. It never rewrites a project's own rules, stack or commands. It writes
   `AGENTS.md` only where there is none: from a `CLAUDE.md` that holds rules,
   word for word, or else from the template.
3. Whatever it replaces or moves is backed up first.
4. It installs a release, from a committed starter; only `--allow-unreleased`
   and `--allow-dirty` say otherwise, and they are for testing adopt.
5. In private mode it writes no file that git would track.
6. It never wires the docs-first hook while `AGENTS.md` has slots, because
   there the hook would block the running session's work.
7. It names every seeded file it keeps although the starter changed it after
   the release in `.claude/starter-version`, with the `git diff` that shows
   the change.

### How the version moves, from 1.0.0

| The change | Bump |
|---|---|
| Anything above removed, renamed or narrowed: a command, flag, exit code, file, location, marker or format; a promise weakened; a check that fails a project which passed before, with nothing in the project changed | MAJOR |
| Something added that every existing project passes or skips: a command, flag, check, seeded file or promise | MINOR |
| A tool brought back to what its documentation already says. When that can turn a gate red, the changelog entry says so | PATCH |

The commit's type names the row: `!` for MAJOR, `feat` for MINOR, `fix` for
PATCH. Until 1.0.0, section 7 of `AGENTS.md` applies: what is MAJOR above is
MINOR.

---

## Changing the starter

The starter follows its own rules and is released like a product: work stays
local until a release is ready, and a project only ever receives a release.

1. **Work on a local branch.** `main` moves only at a release. adopt refuses
   to install anything that is not a release, so a project never picks up
   work in progress.
2. **One commit is one complete change**: the code, its test, the documents it
   touches, the README at the root included, and its line under
   `[Unreleased]` in `CHANGELOG.md`. A fix to work that is not released yet
   goes into the commit it fixes.
3. **Pass before every commit.** `node _starter/selftest.mjs` and
   `node tools/docs-drift.mjs` pass; `node .claude/tools/agent-check.mjs`
   fails here by design, because this `AGENTS.md` is the template. A fix gets
   a test that pins the defect, and the fix is broken once on purpose, in a
   copy, to see that test fail and nothing else: `node _starter/mutate.mjs`
   does both, and reports nothing while the unbroken suite fails.
4. **Release a coherent set of changes when the owner asks**, never one check
   at a time. Verify the candidate first: the self-test, the gate, and
   `node tools/adopt.mjs --into ../<project> --allow-unreleased` as a dry run
   into every project. Read the README and this guide against the release's
   changelog entries, and fix what they no longer describe. Then make one
   commit, `chore(release): X.Y.Z`, with the version the commits since the
   last release decide (public API, above). Push `main`, wait for CI on
   Ubuntu, macOS and Windows, and only then tag `vX.Y.Z` and push the tag. A
   defect found before the tag is fixed inside the release, not in a new
   version.
5. **Publish a GitHub Release from the tag**, with that version's section of
   `CHANGELOG.md` as its notes. People who watch the repository are notified
   of releases, not of tags.
6. **Bring the projects up to date** with adopt from the tagged release, dry
   run first.

Commit messages follow Conventional Commits: an imperative summary of about 72
characters at most, and a body only when the reason is not obvious, in
technical terms. A message describes the change, not the conversation that led
to it. Changelog entries are one line each, under Added, Changed, Deprecated,
Removed, Fixed or Security, written for the person who upgrades.

The repository is public. Nothing in it describes one machine or another
repository: no personal paths, no other projects' names, registries or
measurements. Check the diff for them before every push. The starter is also
agnostic: it assumes no language or stack, and holds no preference of its
owner as a rule; what is specific to one project lives in that project's own
folder. The license and copyright notices are the only exception.
