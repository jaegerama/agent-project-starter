# agent-project-starter

A starting point for software projects built with AI coding agents: Claude
Code, Codex, Cursor, GitHub Copilot, Gemini CLI or Antigravity.

It gives every project the same way of working. All the agents read one file
of rules, you describe the project once in a short form instead of in chat,
and checks run on your own machine before every push. It does not choose a
language, framework or stack: each project takes those from its own brief.

## Why it exists

Work with coding agents tends to go wrong in the same few ways:

- Agents forget. Whatever you explained in a chat is gone in the next
  session, after a `/clear`, or when you switch to another tool.
- Agents guess. A detail nobody stated, such as a pricing rule or the
  database to use, gets a plausible answer that nobody decided.
- Claims go unchecked. "Tests pass" is reported without the tests having run,
  and documents keep describing what the code no longer does.

The starter answers each of these. The rules live in a file that every
session reads. Anything your brief does not answer becomes a written question
for you instead of a guess. The claims that can be checked are checked by
scripts, before the work leaves your machine.

## How a project runs

1. You fill in a short brief, `docs/BRIEF.md`: what the project is, the
   business rules the agent must not invent, the stack, and a few conventions.
   Whatever you have not decided yet, you write as "ask me".
2. The agent sets the project up by following the Setup section at the top of
   `AGENTS.md`. It writes the project's rules from your brief, lists every open
   point in `docs/QUESTIONS.md`, and asks you all of them in one message.
3. Work happens one story at a time. Each story has acceptance criteria that
   can be checked from a terminal, and its proof goes into `HANDOFF.md` before
   the next story starts.
4. Before every push, git runs the gate: the project's list of checks, written
   in `AGENTS.md`. When a check fails, the push stops.

Every tool reads the same rules from `AGENTS.md`; the few that look for a file
of their own get a short pointer to it. Section 11 of `AGENTS.md`
[lists each tool](AGENTS.md#11-per-tool-notes) with the file it reads and what
has been confirmed for it.

## Requirements

- Node.js 22 or newer. The checks are small Node.js scripts with no
  dependencies, so Node.js is needed even when the project itself is written
  in another language.
- git.
- On Windows, Git Bash, which Claude Code uses to run its hooks.

## Start a new project

1. Once per machine, install an operator profile if you have none yet: your
   own rules for every project, kept outside them.
   [`_starter/operator-profile.md`](_starter/operator-profile.md) is an
   example, and says where each tool reads it.
2. Clone the starter under your project's name:

   ```bash
   git clone https://github.com/jaegerama/agent-project-starter.git my-app
   ```

3. Fill in `docs/BRIEF.md`, or be ready to describe the project in chat.
4. Open your coding agent in the `my-app` folder and ask it to set up the
   project. The Setup section of `AGENTS.md` gives it every step, including
   this command:

   ```bash
   node tools/bootstrap.mjs --name "My App" --apply
   ```

`bootstrap` names the project and starts a fresh git history. It replaces
this page and the changelog with the project's own, and removes what else
belongs to the starter: `_starter/`, the starter's CI workflow,
`tools/adopt.mjs` and the `LICENSE`. Without `--apply` it only shows what it
would do. It refuses to run in a folder still called `agent-project-starter`,
which is why step 2 clones under the project's name.

## Bring in an existing project, or update one

Both are done by `adopt`, run from a separate clone of the starter, not from
inside the project:

```bash
node tools/adopt.mjs --into ../my-project            # dry run: reports, writes nothing
node tools/adopt.mjs --into ../my-project --apply    # applies, backing up what it replaces
```

`adopt` installs releases only, backs up every file it replaces, and never
rewrites the project's own rules, code or commands; a file the project has
changed is kept, and the report says when the starter changed it since. The
[public API](_starter/README.md#public-api-what-a-version-number-protects)
lists everything it promises.

`adopt` does not set up git hooks. In an existing project the gate runs before
every push once its pre-push hook calls `node tools/gate.mjs`; a project with
no hooks of its own can copy `.githooks/pre-push` from the starter and run
`git config core.hooksPath .githooks` once.

To update a project to a new release:

1. To hear about new releases, open this repository on GitHub and choose
   Watch, then Custom, then Releases.
2. In your clone of the starter, fetch the latest release. `main` only moves
   when a release is made, so a pull is enough:

   ```bash
   git pull
   ```

3. Read [`CHANGELOG.md`](CHANGELOG.md) from the release your project records
   in `.claude/starter-version` up to the new one. An entry that can make a
   project's checks fail says so.
4. Run the dry run, read its report, then run the command again with
   `--apply`.
5. Run the project's gate. If something is wrong, the files `adopt` replaced
   are in the backup folder its report names.

While the version starts with `0.`, any minor release (0.7 to 0.8, for
example) may change how the checks behave; from 1.0.0 only a major release
will.

## What is in the repository

| Path | What it is for |
|---|---|
| `AGENTS.md` | The project's rules, with slots for the decisions each project makes. The checks fail while a slot is empty |
| `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` | Pointer files: each sends its tool to `AGENTS.md` and holds no rules |
| `docs/BRIEF.md` | The form the owner fills in. The rest of the project is set up from it |
| `docs/` | What is built and why, the stories, the open questions, and how the parts fit |
| `DESIGN.md` | The design direction of an interface, written by the owner |
| `tools/gate.mjs`, `.githooks/pre-push` | The gate runner, and the git hook that runs it on your machine before every push. Nothing runs on a server |
| `tools/docs-drift.mjs` | A gate step that compares documents with code, such as the gate's commands with the project's manifest |
| `.claude/` | The agent setup check, the Claude Code hook that refuses application code while slots are empty, the review severity ladder, the `/gate` and `/docs-drift` commands, and a reviewer that looks for swallowed errors |
| `tools/bootstrap.mjs`, `tools/adopt.mjs` | Turn a copy into a new project; bring an existing project in or up to date |
| `_starter/` | The starter's own guide, state and tests, and the `README.md`, `CHANGELOG.md` and `HANDOFF.md` a project starts with. `bootstrap` removes it |
| `.github/workflows/` | The starter's own CI, which tests the starter on Ubuntu, macOS and Windows. `bootstrap` removes it, so a project has no CI workflow |
| `README.md`, `CHANGELOG.md`, `LICENSE` | This page, the starter's release history, and its license |

## What a machine enforces, and what is only written down

Every rule says which it is, because a rule that only looks enforced makes
everyone stop watching it. In short: in every tool, the gate checks for empty
slots, pointer files that grew rules, and the order of the stories, and git
runs the gate before every push. Claude Code adds a hook that refuses
application code while slots are empty. Docs first, changelog first and "no
new dependency without approval" are written down only.
[The full table](AGENTS.md#which-of-these-is-a-mechanism-and-which-is-still-an-intention)
is in section 11 of `AGENTS.md`.

`git push --no-verify` skips the hook: it guards against forgetting, not
against intent.

## Words used in this repository

| Word | Meaning |
|---|---|
| Agent | An AI coding assistant that reads and changes the files of a project |
| Harness | The program an agent runs in, such as Claude Code or Codex. It decides which files the agent reads and which checks run |
| Brief | The owner's description of the project, in `docs/BRIEF.md` |
| Slot | A decision a template still leaves open, written in angle brackets. The checks fail while one is empty |
| Pointer file | A short file that sends one tool to `AGENTS.md` and holds no rules of its own |
| Gate | The list of checks every change must pass, in section 4 of `AGENTS.md` |
| Docs drift | A document that no longer matches the code it describes |
| Story | One small piece of work, with acceptance criteria that can be checked |
| Walking skeleton | The smallest version of the project that runs end to end with one passing test. It is always the first story |
| Operator profile | Your own rules for every project on one machine, kept outside the projects |
| Private agents | A mode for team repositories: the agent files stay on each developer's machine and are never pushed |

## Changing the starter

[`_starter/README.md`](_starter/README.md) explains how the starter is built,
what each release promises, and how it is changed and released. Before every
commit both of these must pass, and CI runs them on Ubuntu, macOS and Windows:

```bash
node _starter/selftest.mjs
node tools/docs-drift.mjs
```

## License

MIT. A project created with `bootstrap` does not inherit this `LICENSE`; the
tool files keep their MIT notice.
