# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [Semantic Versioning](https://semver.org/).

This is the **starter's own** history. A project created from it starts with an
empty `CHANGELOG.md` at the root.

The starter lived in a private repository until 2026-10-05, and that history is
not published: it describes other private repositories. What it taught is kept
where it applies, in the code comments and in the cases of `_starter/selftest.mjs`.

---

## [Unreleased]

### Changed: the template holds no preference of its owner (2026-10-07)

The template carried its owner's own choices as every project's rules: commit
messages in English with no co-author or tool trailer, three named third-party
skills, technical terms kept in English whatever the prose language, and an
interface section built on one style skill, with its rule numbers, its dials
and a ban on the em dash in UI text. Commit language and trailers are slots
now, and the skills are this project's own list. The interface section states
what holds for any interface in its own terms: WCAG 2.2 at level AA, and an
empty, a loading and an error state for every view that shows data.
`DESIGN.md` keeps its direction fields without one skill's vocabulary, and the
minimal-code ladder is named for what it does. The example profile leaves the
trailer decision to whoever installs it. A project made earlier keeps these
rules in its own `AGENTS.md`, where they are that project's.

### Changed: the profile checks run only for a profile marked as one (2026-10-07)

agent-check required every tool's global instructions to equal one master, so
anyone who keeps different notes for Claude Code and for Codex, on purpose,
got a red gate in every project. The two profile checks now run only when the
master, `~/CLAUDE.md` or `~/.claude/CLAUDE.md`, carries the line
`<!-- operator-profile -->`, and skip otherwise. The block check no longer
names one tool: every block between `<!-- name:start -->` and
`<!-- name:end -->`, whatever the name, must read the same in the master and
in `~/.claude/CLAUDE.md`. A machine that relied on the checks adds the line to
its master and copies the master over again; until then both skip. The
example profile carries the line, the public README asks for a profile before
the first project, and `_starter/INTAKE.md` lists what the example covers
rather than what one machine's profile happened to.

## [0.3.0] - 2026-10-07

adopt refuses to copy starter files with uncommitted changes, writes the
release it installed to `.claude/starter-version`, and says when no gate in a
project runs agent-check. New projects get a docs-drift that fails once setup
is done and nothing was checked. adopt's import helper writes the byte order
mark as an escape again.

### Changed: docs-drift fails when setup is done and no check ran (2026-10-07)

A docs-drift run in which every check skipped exited 0 with a note, so a gate
could stay green that way while checking nothing. Once setup is over,
which `AGENTS.md` shows by no longer having its Setup section, such a run now
fails, and step 7 of the Setup section asks for at least one check that runs.
A new project still in setup gets the note and exit 0, as before.
`tools/docs-drift.mjs` belongs to the project, so this reaches new projects;
adopt leaves an existing copy alone.

### Added: adopt says when no gate runs agent-check (2026-10-07)

agent-check guards a project only when its gate runs it, and a project whose
gate is its own can easily have none that does; a private repository cannot
put it in a tracked gate at all, because clones and CI have no `.claude/`.
adopt's report now names that case. It looks
for `node .claude/tools/agent-check.mjs` in `AGENTS.md`, `CONTRIBUTING.md`,
`.claude/commands/gate.md`, the package and make manifests, and any file in
`scripts/` with gate in its name, counting a file this run seeds. A mention
anywhere in those files counts, so prose that says to run it is enough.

### Fixed: two invisible characters in adopt (2026-10-07)

0.2.0 wrote the byte order mark in adopt's import helper as the character
itself, which no editor or diff shows, where the code around it writes the
escape. It behaved the same, and it is an escape again. The self-test now
fails on any file in the starter that carries the character.

### Added: adopt refuses an uncommitted source, and records the starter version (2026-10-07)

adopt copies the starter as it is on disk, and a project session once ran it
while the starter was mid-edit, installing a change nobody had committed.
adopt now refuses, and writes nothing, while a file it copies, or adopt
itself, has uncommitted changes; `--allow-dirty` is for testing adopt. It
also writes `.claude/starter-version` into the project: the release tag when
the files it installs match that release, or the tag plus the last commit
that changed them. A commit that touches only other files leaves the version
alone, so the file changes only when what the project runs changes. A starter
that is not a git checkout records no version.

## [0.2.0] - 2026-10-07

adopt now brings an old `GEMINI.md` pointer its import line, and the profile
check covers Antigravity's global rules. New projects also get the
Makefile-aware gate-command check and a silent-failure-hunter that can only
read, and they no longer carry adopt, nor bootstrap once setup is done.
Documents, comments and command output carry no em dash.

### Removed: adopt from new projects, and bootstrap once setup is done (2026-10-07)

`tools/adopt.mjs` runs only from the starter and refuses to run anywhere else,
yet every bootstrapped project kept a copy. bootstrap now removes it on its
first run, with the other files that belong to the starter alone.
`tools/bootstrap.mjs` still has work during setup, where a second run lists
the slots left, so the last step of the Setup section in `AGENTS.md` deletes it
together with that section once the slot check is green.

### Fixed: silent-failure-hunter could edit files through Bash (2026-10-07)

The agent's instructions say it reports and never edits, but its tools
included Bash, and a shell can rewrite any file. Its tools are now Read, Grep
and Glob, so the rule is a mechanism instead of a request. It can no longer run
`git diff` or a test itself: the caller names the files or pastes the diff,
and its description says so. adopt seeds this file only where it is missing,
so an existing project keeps its own copy until its owner changes it.

### Added: adopt gives an old GEMINI.md its import line (2026-10-07)

adopt copies `GEMINI.md` only when it is missing, so a project adopted before
0.1.0 kept the pointer it was seeded with, one that asks in words to read
`AGENTS.md`. Gemini CLI reads `GEMINI.md` and reaches `AGENTS.md` only through
the `@./AGENTS.md` import, so those projects never got it. adopt now adds that
line after the title of a `GEMINI.md` pointer that lacks one, keeps the rest
and backs up the old copy, as it already did for `CLAUDE.md`. A `GEMINI.md`
that already imports `AGENTS.md`, or holds rules of its own, is left alone.
Whether Antigravity loads `AGENTS.md` natively or through this import no
longer matters: with the line in place it loads either way, and in the session
that was tested it loaded once with both present.

### Fixed: the profile check missed Antigravity's global rules (2026-10-06)

Antigravity does not read `~/.gemini/GEMINI.md`. In a live session its global
rules came from `~/.gemini/config/AGENTS.md`, a separate and older profile that
no check compared with the master. The profile check now compares that file
too when it exists, so a machine where Antigravity runs on other rules goes
red. The example profile, `AGENTS.md` §11 and the READMEs list it among the
copies. A second home, such as a WSL distro, keeps its own copies, and the
check sees only the home it runs in.

### Changed: Antigravity is verified to load AGENTS.md (2026-10-06)

A fresh Antigravity session (Gemini 3.8 Flash, on Linux) in a clone of the
starter loaded both `AGENTS.md` and `GEMINI.md` as workspace rules at session
start. Before using any tool it quoted the last sentence of `AGENTS.md`, which
then matched the file exactly. From its terminal the gate behaved as
expected: agent-check red only on the template's slots, docs-drift green.
`AGENTS.md` §11 and the README now say verified. Still open: whether it loads
`AGENTS.md` natively or through the `@./AGENTS.md` line in `GEMINI.md`, which
it showed resolved to an absolute path.

### Added: the gate-command check reads Makefile targets (2026-10-06)

The check that a gate's commands exist knew npm, pnpm, yarn and composer, and
skipped every project without a `package.json` or `composer.json`. It now also
checks each `make <target>` in the gate against the targets the project's
Makefile defines, so a Go, Python, Rust or C project that drives its gate
through make is checked too. A variable assignment is not a target, and an
invocation with `-C` or `-f` points at another makefile, so it is left alone.
`tools/docs-drift.mjs` belongs to the project: new projects get the check, and
adopt leaves an existing project's copy alone.

### Changed: the self-test's fixtures name no one (2026-10-06)

Two fixtures used the owner's GitHub handle as the sample git identity, and a
fixture heading used the repository's last em dash. They use
`Jane Doe <jane@example.com>` and a colon now, and each case still tests what
it tested.

### Changed: documents without em dashes, and two statements brought up to date (2026-10-06)

The documents carried 77 em dashes, which antislop's R-02 bans from any text.
Each became a colon, a comma, parentheses or a new sentence, whichever the
sentence meant; story headings in `docs/TODO.md` now read
`### [TODO] S0.1: title`, which the story check reads the same way. The prose
language slot in `AGENTS.md` §0 no longer suggests one particular language.

Two statements had fallen behind this release: the header of `AGENTS.md` said
Gemini CLI reaches it through a pointer that asks in words, and
`_starter/INTAKE.md` counted two example checks in `tools/docs-drift.mjs`.
Gemini CLI imports it, and there are three.

### Changed: command output without em dashes (2026-10-06)

Eight messages printed by agent-check, bootstrap and docs-drift used an em
dash, which antislop's R-02 bans from any text a person reads. They use a colon
or a comma now, and none changed its meaning. bootstrap's dry run says
"DRY RUN, nothing was changed", as adopt's already did.

### Changed: code comments state the constraint, not its history (2026-10-06)

The tool files carried long comments about how each rule came to be: dates,
earlier versions, the project that found the defect. antislop-code asks a
comment to state its constraint in one or two lines, and the history already
lives in the self-test, where each case names the defect it pins. The comments
now state the constraint, and the decorative section banners are gone. Only
comment lines changed, checked line by line against the previous commit: 355
comment lines out, 123 in, and the self-test still passes all 120 cases.

## [0.1.0] - 2026-10-05

The first public release: the starter imported from its private repository,
and the fixes from the audit in `_starter/AUDIT-2026-10-05.md`.

### Added: a public landing page, a maintenance guide, and the audit (2026-10-05)

GitHub shows `.github/README.md` before the root one, so the starter gets a
landing page of its own while the root `README.md` stays the template a
project fills; bootstrap removes the page from projects. `_starter/README.md`
gains the steps for changing the starter by its own rules.
`_starter/AUDIT-2026-10-05.md` records the audit this release came out of:
each finding, the evidence for it, and the commit that fixed it.

### Added: CI runs the self-test on Ubuntu, macOS and Windows (2026-10-05)

The tools had been run on one Windows machine only, while projects are worked
on from all three. `.github/workflows/selftest.yml` runs `_starter/selftest.mjs`
and `tools/docs-drift.mjs` on every push to `main` and every pull request, on
Node 24 everywhere and Node 22 on Ubuntu, through bash, the shell Claude Code
runs hooks with. The actions are pinned to commit SHAs and the token can only
read. bootstrap removes the workflow from projects. `.gitattributes` keeps
every checkout LF, so adopt's and the self-test's byte comparisons agree
across machines.

### Fixed: `git push -f` and `git clean` were allowed, home credentials readable (2026-10-05)

`git push --force` was denied and `git push -f` was not, and nothing denied
`git clean`, which deletes untracked files that no commit can restore. Both
are denied now, and so are the credential files tools keep in the home
directory (`~/.ssh/id_*`, `~/.aws/credentials`, `~/.config/gh/hosts.yml`,
`~/.git-credentials`, `~/.netrc`, `~/.npmrc`, `~/.docker/config.json`) and
`*.p12` and `*.pfx` key stores.

Tested in a session on Windows with dummy files, because the documentation
answer disagreed with the result twice: the denies hold in `bypassPermissions`
mode, `cat .env` in Bash is denied as well, `Read(./.env)` already covers a
`.env` in any subdirectory, and a `~/` pattern matches on Windows. `node -e`
reading `.env` printed the file: the denies stop the Read tool and the common
shell readers, not an interpreter. `AGENTS.md` §11 says so.

### Changed: one copy of each rule, and claims that match the mechanisms (2026-10-05)

Three changes made on 2026-10-05, before the import, put the review severity
ladder, a UI baseline and the general working process into `AGENTS.md` a
second time, and the copies had already drifted: the ladder in `AGENTS.md`
listed 4 CRITICAL shapes against the rules file's 11, and the two UI
baselines disagreed on the spacing scale. Each rule has one home again. The
ladder lives in `.claude/rules/review-severity.md`. The UI baseline is gone
from `DESIGN.md`, which only the owner writes: it prescribed hairline borders
on neutral solid surfaces, the pattern antislop calls the Sterile Default.
`AGENTS.md` keeps one paragraph of antislop's hard gates, by rule number, for
tools without antislop. The working-process rules are in the example profile.

§3 no longer overrules a framework's own layout. §0.1 puts the PRD
decomposition first, the order setup already used. §7 maps commit types to
version bumps as Conventional Commits does, so `chore:` and `refactor:` no
longer bump PATCH. §11 says what each rule is in each tool, partial ones
included.

### Added: an example operator profile, and an import in GEMINI.md (2026-10-05)

`AGENTS.md` leaves the working process, verification, reporting and git rules
to the operator profile, and a machine without one had nothing there.
`_starter/operator-profile.md` is an example to install once per machine.
`GEMINI.md` imports `AGENTS.md` with `@./AGENTS.md`, which Gemini CLI
documents; it used to ask in words, the failure Claude Code had before its
own import. Until a session shows the file loaded, `AGENTS.md` §11 says
documented, not observed. `AGENTS.md`, `CLAUDE.md` and `GEMINI.md` now name
the master profile the code reads, `~/CLAUDE.md`, where they said
`~/.claude/CLAUDE.md`.

### Security: agents no longer install skills (2026-10-05)

`AGENTS.md` §2.1 told agents to install three third-party skills. A skill is
the agent's next prompt, so installing one means running instructions fetched
from the network, with the agent's permissions. The owner installs skills now;
an agent never installs, updates or fetches one, and works without a skill
that is missing. ui-ux-pro-max is for layout and accessibility craft, not for
choosing a palette or a typeface: those come from `DESIGN.md`, which the owner
writes.

### Added: a check that one story is in WIP and Epic 0 comes first (2026-10-05)

A new check in `tools/docs-drift.mjs` reads the story headings in
`docs/TODO.md`: more than one story in WIP, or a story past Epic 0 started
while the walking skeleton is not DONE, turns the gate red. Until now only
`AGENTS.md` §0.1 said so. `tools/docs-drift.mjs` belongs to the project: new
projects get the check, and adopt leaves an existing project's copy alone.

### Fixed: the gate-command check was red on correct gates (2026-10-05)

The check that a gate's commands exist read `pnpm install`, `pnpm run build`,
`yarn run lint`, `composer install` and `composer run lint` as calls to
scripts named `install` and `run`, so a correct gate for those package
managers went red. It now knows each manager's own subcommands, reads commands
only from code in the document, and catches `npm test` with no `test` script,
which it used to pass.

### Fixed: bootstrap could dismantle a clone of the starter, and projects inherited its license (2026-10-05)

bootstrap refused to run only in a folder named `project-starter`. A
`git clone` of the public repository lands in `agent-project-starter`, where a
dry run reported it would delete `_starter/` and the git history. The
self-test runs that very command in the starter's root, so on CI, whose
checkout carries the repository's name, it would have dismantled the checkout
it was testing. Both names are refused now. `--name --apply` named the project
`--apply` and applied; a name that starts with `-` is refused.

Every bootstrapped project also kept the starter's `LICENSE`, so a company
project carried an MIT license with a personal copyright. On its first run
bootstrap now removes the files that belong to the starter alone: `_starter/`,
`LICENSE`, `.github/README.md` and the self-test workflow. The tool files that
travel into projects carry an SPDX line with the MIT notice instead. A later
run leaves all of them alone, because by then a `LICENSE` may be the
project's own.

### Fixed: false greens and false reds in the agent checks (2026-10-05)

The slot pattern stops at a newline, so a slot that wraps onto a second line is
never counted. Four in `AGENTS.md` did, and the gate never saw them: the
directory map, the signed-callback rule, the known-traps note, and the §9 list
of business rules that may not be invented. Eight more in `docs/PRD.md` and
`docs/ARCHITECTURE.md` did too, so bootstrap reported 3 slots for a PRD made of
slots. Every template slot is single-line now, guidance that sat inside the
brackets is plain text, and the self-test fails on any template slot that
wraps. The PRD's non-functional requirements came pre-filled with decisions,
zero-cost infrastructure among them; they are slots now. A slot holding `TBD`,
`TBC`, `TODO`, `?`, `...` or `<TBD>` counted as filled; it counts as empty now,
in the same three places `<>` does.

The pointer check accepted a `CLAUDE.md` whose `@AGENTS.md` line sat in
backticks or in a code block, where Claude Code does not import it. It now
requires the import line outside code. The 60-line limit had two definitions,
and a 60-line pointer was a pointer to adopt and a violation to the gate. Both
read `.claude/tools/lib/pointer.mjs` now.

On a machine without the owner's exact layout, the two profile checks went
red: antislop installed in `~/.claude/CLAUDE.md` alone, or a `~/CLAUDE.md`
with no copies. The profile check now takes `~/.claude/CLAUDE.md` as the
master where there is no `~/CLAUDE.md`, compares the copies that exist, and
skips when there are none. The antislop-block check skips without a
`~/CLAUDE.md`.

### Fixed: the docs-first hook failed open after a `cd` (2026-10-05)

Observed in a live session: a Write to `src/` was blocked from the project
root and allowed after `cd docs`. The hook command was a relative path,
Claude Code runs a hook in the session's current directory, and a hook that
cannot start counts as a non-blocking error. The command now starts from
`$CLAUDE_PROJECT_DIR`, and the script looks for `AGENTS.md` there.

Three smaller gaps closed with it. A relative path such as
`docs/../src/app.ts` passed as a docs file. NotebookEdit was never checked,
because it names its target `notebook_path`. Every file under `tools/`
counted as setup, so application code there passed. `LICENSE`,
`.gitattributes` and `CONTRIBUTING.md` are now setup files, and the block
message asks for the owner instead of telling the agent to widen the
allowlist itself. A file written through Bash is still invisible to the hook;
`AGENTS.md` §11 now says so. adopt moves an existing hook entry to the new
command.

### Added: the starter, imported into a public repository (2026-10-05)

Imported with the details of other private repositories removed: their names,
registry and image names, machine measurements, and the laptop maintenance
scripts, which stay on the machine they were written for. The one code change
the import needs is in bootstrap, which recognises a copied starter by its
root commit: it now accepts the public root commit as well as the private one.

[Unreleased]: https://github.com/jaegerama/agent-project-starter/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/jaegerama/agent-project-starter/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jaegerama/agent-project-starter/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jaegerama/agent-project-starter/releases/tag/v0.1.0
