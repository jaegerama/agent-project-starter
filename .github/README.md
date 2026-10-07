# agent-project-starter

A project template for working with AI coding agents (Claude Code, Codex,
Cursor, Gemini CLI, Antigravity). It keeps one rules file, checks itself, and
says plainly which of its rules a machine enforces and which are only written
down.

It carries a process, not a stack. The stack, the commands and the business
rules come from each project's own brief, and the template refuses to guess
them: a rule it cannot fill from the brief becomes a question.

## What is in it

| Path | What it does |
|---|---|
| `AGENTS.md` | The only place project rules live: a template with slots. While one slot is empty, the gate is red |
| `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` | Pointers to `AGENTS.md` that hold no rules of their own. The first two import it |
| `.claude/hooks/guard-slots.mjs` | Claude Code hook: no application code through Write, Edit or NotebookEdit while `AGENTS.md` has slots |
| `.claude/tools/agent-check.mjs` | Gate step: slots, pointers, and the copies of the operator profile |
| `tools/docs-drift.mjs` | Gate step: documents against code, such as gate commands against the manifest and story markers in `docs/TODO.md` |
| `tools/bootstrap.mjs`, `tools/adopt.mjs` | Turn a copy into a project; bring an existing project onto the starter |
| `docs/`, `HANDOFF.md`, `DESIGN.md`, `CHANGELOG.md` | Skeletons for the PRD, stories, questions, session state and design direction |

## Requirements

- **Node.js 22 or newer**, in every project whatever its language. The hook and
  the gate steps are Node scripts with no dependencies. Without Node the hook
  fails open and the gate cannot run.
- git.
- On Windows, Git Bash: Claude Code runs hooks through it.

## Start a project

Once per machine, install an operator profile first: the working process every
project follows (docs first, verification, reporting, git) lives there, not in
each project. [`_starter/operator-profile.md`](/_starter/operator-profile.md)
is an example to adapt; [The operator profile](#the-operator-profile) says
where it goes.

```bash
git clone https://github.com/jaegerama/agent-project-starter.git my-app
```

Open an agent session in `my-app` and give it the brief: what the project is,
who it is for, what it is not, the stack if it is decided, and whether the
repository goes to a shared team remote. The Setup section at the top of
`AGENTS.md` does the rest. The agent copies the brief into `docs/BRIEF.md`,
runs `node tools/bootstrap.mjs --name "My App" --apply`, fills the slots the
brief answers, and turns the others into questions in `docs/QUESTIONS.md`.

bootstrap starts a fresh git history and removes the files that belong to the
starter: `_starter/`, this page, the self-test workflow, `tools/adopt.mjs` and
the `LICENSE`. It refuses to run in a folder still named
`agent-project-starter`, so clone under the project's name.

## Bring in an existing project

From a checkout of the starter:

```bash
node tools/adopt.mjs --into ../some-project
node tools/adopt.mjs --into ../some-project --apply
```

The first command is a dry run and changes nothing. adopt installs the files
the starter owns, seeds the ones a project customises where they are missing
or still unchanged from an earlier starter version, and never rewrites what
the project changed or its own rules. It installs releases only, refusing a
checkout whose files differ from the latest release tag or have uncommitted
changes, and writes the release it installed to the project's
`.claude/starter-version`. What a release promises, and how its version moves,
is the Public API section of
[`_starter/README.md`](/_starter/README.md#public-api-what-a-version-number-protects).

## What is enforced, and where

| Rule | Claude Code | Codex, Cursor, Gemini CLI, Antigravity |
|---|---|---|
| `AGENTS.md` is in the agent's context | Import in `CLAUDE.md`, observed | Loaded at session start in Antigravity, observed; native in Codex and Cursor, and imported by `GEMINI.md` in Gemini CLI, documented but not yet observed |
| No application code while slots remain | Hook, for the file tools only. A file written through Bash is not seen | Gate only |
| No empty slot; pointers stay pointers | Gate | Gate |
| One story in WIP, and Epic 0 first | Gate | Gate |
| Secret files are not read | The Read tool and common shell readers are denied; an interpreter one-liner is not | Not enforced |
| Docs first, changelog first, no new dependency without approval | Written down only | Written down only |

"Gate" means `node .claude/tools/agent-check.mjs` and `node tools/docs-drift.mjs`
plus the project's own checks. Nothing runs it for you unless CI does.

## The operator profile

Rules that hold in every project on a machine (working process, verification,
reporting, git) live outside the project, in an operator profile:
`~/.claude/CLAUDE.md` for Claude Code, or `~/CLAUDE.md` for projects under the
home directory. A machine that wants the same profile in every tool copies the
master to `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md` and
`~/.gemini/config/AGENTS.md` (Antigravity), and marks it with the line
`<!-- operator-profile -->`: the gate then goes red when a copy drifts from the
master. Without the line, the gate leaves each tool's notes alone.
[`_starter/operator-profile.md`](/_starter/operator-profile.md) is an example
to start from.

## Changing the starter

[`_starter/README.md`](/_starter/README.md) explains the design and how to
change it, and [`_starter/AUDIT-2026-10-05.md`](/_starter/AUDIT-2026-10-05.md)
is the audit before the first release, with the evidence for every finding.
Two commands must be green before any commit, and CI runs them on Ubuntu,
macOS and Windows:

```bash
node _starter/selftest.mjs
node tools/docs-drift.mjs
```

## License

MIT. A project created with bootstrap does not inherit this `LICENSE`; the tool
files keep their MIT notice.
