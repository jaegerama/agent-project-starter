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

Open a session in the copy and give the brief: what it is, who it is for,
what it is not, the stack if it is decided, whether it goes to a shared team
remote. That is the whole of the owner's part. Chat or `docs/BRIEF.md`, any
language.

Everything after that is the **Setup** section at the top of `AGENTS.md`,
which every tool loads at session start:

| # | Done by the agent | Why |
|---|---|---|
| 1 | Copy the brief into `docs/BRIEF.md` verbatim | A brief in chat is gone after the next `/clear` or tool switch |
| 2 | `node tools/bootstrap.mjs --name "Project Name" --apply`, plus `--private-agents` for a team remote | The mechanical part: name, starter files deleted, a fresh git history |
| 3 | Fill every slot the brief answers, starting with `AGENTS.md` | Stack, commands and way of working come from this brief, never from another project |
| 4 | Turn every slot the brief does not answer into a question in `docs/QUESTIONS.md` | A guessed stack or rule reads exactly like a decided one |
| 5 | `node .claude/tools/agent-check.mjs` until the slot check is green, then report and ask | The machine that confirms setup is finished |

Bootstrap replaces `<PROJECT NAME>`, deletes `_starter/` and the other files
that belong to the starter (`LICENSE`, `.github/README.md`, the self-test
workflow, `tools/adopt.mjs`), and prints the slots still to fill. Duplicating in Explorer copies the hidden `.git` too, so on the
first run it also removes the starter's inherited history and starts a fresh
one: otherwise a private-agents project keeps `AGENTS.md` and `.claude/`
tracked, and pushes them on the first push. Without `--apply` it is a dry run,
and it refuses to run inside a folder called `project-starter` or
`agent-project-starter`.

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
project customises only where they are missing, and moves a `CLAUDE.md` that
holds rules into `AGENTS.md` verbatim. A `CLAUDE.md` or `GEMINI.md` pointer
with no import line gets one after its title, and nothing else in it changes.
Whatever adopt replaces is backed up into `.claude.backup-adopt-*`. The
project's own stack, commands and rules are never rewritten. Re-run it after the starter changes: that is what keeps every
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

### The operator profile (persona, hard limits, verification)

Not inherited across tools automatically. The master is:

```
~/CLAUDE.md              ← change it here
  → ~/.codex/AGENTS.md
  → ~/.gemini/GEMINI.md
  → ~/.gemini/config/AGENTS.md   (Antigravity)
```

Sync by copying the master over every copy. On a machine without `~/CLAUDE.md` the
master is `~/.claude/CLAUDE.md`, and a check with no copy to compare skips. The third check in `.claude/tools/agent-check.mjs`
compares them all and goes red when one diverges, which has already happened
once: `~/.gemini/GEMINI.md` carried a separate English profile with port 3000
hardcoded.

`~/.claude/CLAUDE.md` is not a copy of the profile. It carries only
the antislop block, because it is the one file Claude Code loads in every
session whatever the working directory. The fourth check in `.claude/tools/agent-check.mjs` compares that block,
between its HTML comment markers, with the same block in the master.

**Verified for Antigravity, not yet for Gemini CLI:** on 2026-10-06 a fresh
Antigravity session loaded `AGENTS.md` and `GEMINI.md` at session start
(`AGENTS.md` §11). The Gemini CLI import is documented, not yet observed.

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
nobody built. In one day on the source project, three documents were found stating
things the code had stopped doing, and two of them already carried a note from
a previous correction of exactly the same kind.

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

The other files that belong to the starter alone live outside this directory,
and bootstrap removes them from a project with `_starter/`: `LICENSE`,
`.github/README.md` (the repository's landing page),
`.github/workflows/selftest.yml` and `tools/adopt.mjs`, which runs only from
the starter.

---

## Changing the starter

The starter follows its own rules, so a change to it goes the way a change to a
project does.

1. **Changelog first.** The entry goes into `_starter/CHANGELOG.md` under
   `[Unreleased]`, before the change. The root `CHANGELOG.md` is the template a
   project starts with, and stays empty here.
2. **Self-test green.** `node _starter/selftest.mjs` passes before every
   commit. A fix gets a case that pins the defect, and the fix is broken once
   on purpose to see that case go red, and nothing else.
3. **Gate.** `node tools/docs-drift.mjs` passes here too.
   `node .claude/tools/agent-check.mjs` is red in the starter by design: its
   `AGENTS.md` is the template, full of slots.
4. **Commit** with Conventional Commits, the body saying why. CI repeats steps
   2 and 3 on Ubuntu, macOS and Windows.
5. **Release** when the change reaches projects: one commit,
   `chore(release): X.Y.Z`, that turns `[Unreleased]` into the version, and the
   tag `vX.Y.Z`. Then bring existing projects up to date with adopt, dry run
   first.

The repository is public. Nothing in it describes one machine or another
repository: no personal paths, no other projects' names, registries or
measurements. Check the diff for them before every push.
