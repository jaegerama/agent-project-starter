# About this starter

Everything in `_starter/` is documentation about the **starter**, not about the
project. **Delete this whole directory** once the new project is running:
`tools/bootstrap.mjs` does it for you.

It is separated here because the starter's `README.md` used to become the new
project's `README.md` when the folder was duplicated, and a wrong README is the
first document anybody else reads.

---

## A new project: copy, rename, brief

```
project-starter  →  copy or git clone  →  rename to the project
```

Open a session in the copy and give the brief: fill in `docs/BRIEF.md`, a
seven-part form whose conventions hold unless changed, or write it in chat, in
any language. That is the whole of the owner's part, and what is missing is
asked once, in one message.

Everything after that is the **Setup** section at the top of `AGENTS.md`,
which every tool loads at session start:

| # | Done by the agent | Why |
|---|---|---|
| 1 | The brief in `docs/BRIEF.md`: the owner's form, or the chat text verbatim | A brief in chat is gone after the next `/clear` or tool switch |
| 2 | `node tools/bootstrap.mjs --name "Project Name" --apply`, plus `--private-agents` for a team remote | The mechanical part: name, starter files deleted, a fresh git history |
| 3 | Fill every slot the brief answers, starting with `AGENTS.md` | Stack, commands and way of working come from this brief, never from another project |
| 4 | Turn every slot the brief does not answer into a question in `docs/QUESTIONS.md` | A guessed stack or rule reads exactly like a decided one |
| 5 | `node .claude/tools/agent-check.mjs` until the slot check is green, then report and ask | The machine that confirms setup is finished |

Bootstrap replaces `<PROJECT NAME>`, deletes `_starter/` and the other files
that belong to the starter (`LICENSE`, `.github/README.md`, the self-test
workflow, `tools/adopt.mjs`), and prints the slots still to fill. With
`--private-agents` it also writes `CONTRIBUTING.md` from `_starter/templates/`,
for the people who do not have the agent files. Duplicating in Explorer copies
the hidden `.git` too, so on the first run it also removes the starter's
inherited history and starts a fresh one: otherwise a private-agents project
keeps `AGENTS.md` and `.claude/` tracked, and pushes them on the first push.
Without `--apply` it is a dry run, and it refuses to run inside a folder
called `project-starter` or `agent-project-starter`.

In Claude Code, "no code before `AGENTS.md` is filled" is **machine-enforced
for the file tools**: the hook `.claude/hooks/guard-slots.mjs` refuses Write,
Edit and NotebookEdit on application code while `AGENTS.md` has unfilled
slots. A file written through Bash is not seen by it. In Codex, Antigravity and
Gemini that hook does not run: there it is still an intention, and the gate has
to be run by hand.

## An existing project: adopt

```bash
node tools/adopt.mjs --into ../some-project           # dry run, changes nothing
node tools/adopt.mjs --into ../some-project --apply
```

Run from the starter. It installs the files the starter owns, seeds the ones a
project customises where they are missing, updates those the project never
changed (a copy still equal to one of the starter's own earlier versions), and
moves a `CLAUDE.md` that
holds rules into `AGENTS.md` verbatim. A `CLAUDE.md` or `GEMINI.md` pointer
with no import line gets one after its title, and nothing else in it changes.
Whatever adopt replaces is backed up into `.claude.backup-adopt-*`. The
project's own stack, commands and rules are never rewritten. adopt installs
releases only: it refuses a starter whose files differ from its latest
release tag or have uncommitted changes, and records the release in the
project's `.claude/starter-version`. Re-run it after the starter changes: that is what keeps every
project on the same process without making them the same project.

It will not wire the docs-first hook into a project whose `AGENTS.md` still has
slots, because there the hook would block the running session's real work.

## Two modes: committed and private

| | Committed (default) | Private (`--private-agents`) |
|---|---|---|
| For | A personal or local repository | A repository pushed to a shared team remote |
| `AGENTS.md`, pointers, `.claude/` | Committed, travel with every clone | In `.gitignore`, stay on this machine |
| Rules humans need | `AGENTS.md` | `CONTRIBUTING.md` and `docs/`, which are committed |
| The gate a human can see | `AGENTS.md` §4 | `CONTRIBUTING.md` (the drift check reads both) |

Private mode is for team repositories whose owners keep agent configuration
per-developer: a team remote must never receive it. In that mode git cannot
restore the agent files, which is why adopt backs them up before it rewrites
anything.

`CHANGELOG.md` ships empty with an `## [Unreleased]` heading. The rule is that
the entry is written **before** the code, so the file has to be there first or
the rule is unenforceable on day one.

---

## Why one `AGENTS.md` instead of one file per tool

| File | Read by | Contents |
|---|---|---|
| `AGENTS.md` | Codex, Antigravity, Cursor, Copilot | **All the rules** |
| `CLAUDE.md` | Claude Code | pointer with the `@AGENTS.md` import, plus Claude-Code-only notes |
| `GEMINI.md` | Gemini CLI | pointer with the `@./AGENTS.md` import |
| `.github/copilot-instructions.md` | Copilot (some versions) | pointer |

Four files holding the same rules are four sources of truth that will drift:
the exact defect the drift checks were built to catch. A pointer cannot
drift, because it holds no rules.

The second check in `.claude/tools/agent-check.mjs` enforces this: a pointer file that grows
past 60 lines or loses its reference to `AGENTS.md` turns the gate red, and so
does a `CLAUDE.md` whose `@AGENTS.md` import line is gone or sits inside code.

### The operator profile (working process, verification, reporting, git)

Rules that hold on every project of one machine live outside the projects, in
an operator profile, if the machine keeps one. No tool shares it with another:
each reads its own file. Keeping them identical is an opt-in convention, for a
machine that wants one profile in every tool:

```
~/CLAUDE.md, or ~/.claude/CLAUDE.md   the master: change it here
  → ~/.codex/AGENTS.md
  → ~/.gemini/GEMINI.md
  → ~/.gemini/config/AGENTS.md         (Antigravity)
```

The master opts in with the line `<!-- operator-profile -->`, and the copies
are the master copied over again. Then the third check in
`.claude/tools/agent-check.mjs` goes red when a copy diverges, and the fourth
when `~/.claude/CLAUDE.md`, the one file Claude Code loads in every session
whatever the working directory, stops carrying a block of the master marked
`<!-- name:start -->` … `<!-- name:end -->` word for word. Without the line
both checks skip: a machine that keeps different notes per tool is left alone.

**Observed in Claude Code and Antigravity, documented for the rest:** Claude
Code loads `AGENTS.md` through the import in `CLAUDE.md`, and on 2026-10-06 a
fresh Antigravity session loaded `AGENTS.md` and `GEMINI.md` at session start.
Codex, Cursor, Copilot and the Gemini CLI import are documented, not yet
observed (`AGENTS.md` §11).

---

## What this starter does NOT carry

It carries the **process**. It cannot carry the part of a mature project's
quality that is accumulated rather than configured:

- a gate that mechanically blocks: there is nothing to test on day one;
- dozens of tests that read the source and the docs and fail when they
  disagree: there is no code yet to lock;
- notes explaining why each rule exists, every one written after something went
  wrong.

Those take weeks. `INTAKE.md` §C says how to build them in the order that makes
each one cheaper than the last.

**The failure mode this is meant to prevent** is a new project that quotes all
these rules, has none of the enforcement, and lets everybody relax against a net
nobody built. A document goes on stating what the code stopped doing, even
after a correction of exactly that kind, until a check reads it.

Prose asking people to remember does not work. A check that fails does. So when
something in your new project is aspiration rather than mechanism, **mark it as
aspiration** until it is one.

---

## What is in this directory

| File | Contents |
|---|---|
| `README.md` | What you are reading |
| `HANDOFF.md` | The starter's own state and next steps. The root `HANDOFF.md` is the template for projects |
| `selftest.mjs` | The starter's tests. `node _starter/selftest.mjs` must be green before committing a change to the slot pattern, the hook, agent-check, bootstrap, adopt or the docs-drift examples |
| `INTAKE.md` | What has to be filled, and the order to build the enforcement in |
| `operator-profile.md` | An example operator profile, for a machine that has none: installed once per machine, not per project |
| `CHANGELOG.md` | The starter's own history, separate from the project's changelog |
| `AUDIT-2026-10-05.md` | The audit before the first public release: each finding, its evidence, and the commit that fixed it |
| `AUDIT-2026-10-07-agnostic.md` | The review of whether the starter is agnostic: each finding, and the commit that fixed it |
| `templates/CONTRIBUTING.md` | The guide bootstrap writes for a private-agents project. It waits here because GitHub would show a root one as the starter's own |

The other files that belong to the starter alone live outside this directory,
and bootstrap removes them from a project with `_starter/`: `LICENSE`,
`.github/README.md` (the repository's landing page),
`.github/workflows/selftest.yml` and `tools/adopt.mjs`, which runs only from
the starter.

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
| `.claude/hooks/guard-slots.mjs` | Claude Code, as a PreToolUse hook | JSON on stdin | 0 allow; 2 block |

The `/gate` and `/docs-drift` commands and the `silent-failure-hunter` agent
keep their names.

### 2. What the checks decide

- **An unfilled slot** is what `.claude/tools/lib/slot.mjs` matches: the named
  form and the empty forms its comments list.
- **A pointer** is a `CLAUDE.md`, `GEMINI.md` or
  `.github/copilot-instructions.md` of at most 60 lines that names
  `AGENTS.md`. `CLAUDE.md` also imports it, with `@AGENTS.md` on a line of
  its own outside code.
- **A story** is a heading `### [STATUS] S<epic>.<n>: title` in `docs/TODO.md`,
  with STATUS one of TODO, WIP, REVIEW, DONE, BLOCKED. One story in WIP;
  nothing past Epic 0 started before Epic 0 is DONE.
- **Setup is done** when `AGENTS.md` has no heading that starts `## Setup`.
- **The gates**: every command of the `CONTRIBUTING.md` gate is also in the
  `AGENTS.md` gate, where both have one.
- **The operator profile** opts in with a master that carries
  `<!-- operator-profile -->`; a shared block is marked
  `<!-- name:start -->` … `<!-- name:end -->`.

### 3. The files adopt manages, and where they live

| | Files | adopt |
|---|---|---|
| Owned | `.claude/tools/agent-check.mjs`, `.claude/tools/lib/slot.mjs`, `.claude/tools/lib/pointer.mjs`, `.claude/hooks/guard-slots.mjs` | Replaces them, old copy backed up |
| Seeded | `.claude/rules/review-severity.md`, `.claude/commands/gate.md`, `.claude/commands/docs-drift.md`, `.claude/agents/silent-failure-hunter.md`, `GEMINI.md`, `.github/copilot-instructions.md`; in committed mode also `CHANGELOG.md` and `tools/docs-drift.mjs` | Copies a missing one; updates one only while it equals one of the starter's own earlier versions |
| Wired | `.claude/settings.json`: the PreToolUse entry `node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-slots.mjs"` on `Write\|Edit\|NotebookEdit` | Adds it once `AGENTS.md` has no slots |
| Recorded | `.claude/starter-version`: one line, `vX.Y.Z`, or `vX.Y.Z+<commit>` with `-dirty` when the starter was not a release | Writes it on every apply from a git checkout of the starter |
| Backups | `.claude.backup-adopt-<stamp>/` | Writes one per apply that replaces anything |
| Private mode | the `.gitignore` block bootstrap appends, which starts `# agent files: private (bootstrap --private-agents)` | Refuses to write a private file that git does not ignore |

### 4. What adopt promises

1. Without `--apply` it writes nothing.
2. It never rewrites a project's own rules, stack or commands. It writes
   `AGENTS.md` only where there is none: from a `CLAUDE.md` that holds rules,
   verbatim, or else from the template.
3. Whatever it replaces or moves is backed up first.
4. It installs a release, from a committed starter; only `--allow-unreleased`
   and `--allow-dirty` say otherwise, and they are for testing adopt.
5. In private mode it writes no file that git would track.
6. It never wires the docs-first hook while `AGENTS.md` has slots.

### How the version moves, from 1.0.0

| The change | Bump |
|---|---|
| Anything above removed, renamed or narrowed: a command, flag, exit code, file, location, marker or format; a promise weakened; a check that fails a project which passed before, with nothing in the project changed | MAJOR |
| Something added that every existing project passes or skips: a command, flag, check, seeded file or promise | MINOR |
| A tool brought back to what its documentation already says. When that can turn a gate red, the changelog entry says so | PATCH |

The commit's type names the row: `!` for MAJOR, `feat` for MINOR, `fix` for
PATCH. Until 1.0.0, `AGENTS.md` §7 applies: what is MAJOR above is MINOR.

---

## Changing the starter

The starter follows its own rules, and is released like a product: work stays
local until a release is ready, and a project only ever receives a release.

1. **Work on a local branch.** `main` moves only at a release. adopt refuses
   to install anything that is not a release, so a project never picks up
   work in progress.
2. **One commit is one complete change**: the code, its test, the documents it
   touches and its line under `[Unreleased]` in `_starter/CHANGELOG.md`. A fix
   to work that is not released yet goes into the commit it fixes. The root
   `CHANGELOG.md` is the template a project starts with, and stays empty here.
3. **Green before every commit.** `node _starter/selftest.mjs` and
   `node tools/docs-drift.mjs` pass; `node .claude/tools/agent-check.mjs` is
   red here by design, because this `AGENTS.md` is the template. A fix gets a
   case that pins the defect, and the fix is broken once on purpose, in a copy,
   to see that case go red and nothing else.
4. **Release a coherent set of changes when the owner asks**, never one check
   at a time. Verify the candidate first: the self-test, the gate, and
   `node tools/adopt.mjs --into ../<project> --allow-unreleased` as a dry run
   into every project. Then one commit, `chore(release): X.Y.Z`, with the
   version the commits since the last release decide (Public API, above). Push
   `main`, wait for CI on Ubuntu, macOS and Windows, and only then tag
   `vX.Y.Z` and push the tag. A defect found before the tag is fixed inside
   the release, not in a new version.
5. **Bring the projects up to date** with adopt from the tagged release, dry
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
