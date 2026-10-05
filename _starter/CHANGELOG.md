# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [Semantic Versioning](https://semver.org/).

This is the **starter's own** history. A project created from it starts with an
empty `CHANGELOG.md` at the root.

The starter lived in a private repository until 2026-10-05, and that history is
not published: it describes other private repositories. What it taught is kept
where it applies, in the code comments and in the cases of `_starter/selftest.mjs`.

---

## [Unreleased]

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
