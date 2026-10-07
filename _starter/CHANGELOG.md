# Changelog

All notable changes to the starter are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

This is the starter's own history; a project created from it starts with an
empty `CHANGELOG.md` at the root. History before the public import of
2026-10-05 is not published.

## [Unreleased]

### Added

- docs-drift fails when the `CONTRIBUTING.md` gate has a command the
  `AGENTS.md` gate lacks, so an agent never runs less than people must.

### Changed

- docs-drift's failure after setup also says that creating the file a check
  reads is enough.
- `docs/BRIEF.md` is a seven-part form the owner fills, with conventions that
  hold unless changed; a brief in free text still works.
- Setup asks every question in one message, what decides the build first, each
  with the answer the brief suggests where it suggests one.
- The PRD writes a non-functional requirement the brief leaves out as "not
  stated", and asks about it only when a story depends on it.
- The README template's documents table and `docs/TODO.md` no longer send
  readers to `AGENTS.md`, which a private-agents repository does not commit.

### Fixed

- With `--private-agents`, bootstrap writes `CONTRIBUTING.md` from a template:
  the gate and the rules the people without agent files need. The ignore block
  and `AGENTS.md` §4 already sent them there, and nothing created it.

## [0.5.0] - 2026-10-07

### Added

- `_starter/README.md` defines the public API: the commands, checks, files and
  adopt promises a version number protects, and how the version moves.

### Changed

- **Breaking:** adopt installs releases only. It refuses a starter whose files
  differ from its latest release tag; `--allow-unreleased` overrides it for
  testing, and `--allow-dirty` implies it.
- `AGENTS.md` says how to write a placeholder meant to stay, such as a
  command's argument, so that the slot check does not count it.
- Setup says which slots are measured or planned rather than asked, when
  "none" may be written, and what to delete when nothing is deployed.
- The README points at the gate instead of copying it.
- The Definition of Done says Epic 0, as §0.1 does, and asks for a loading
  state only where there is an interface.

### Fixed

- Once setup is done, docs-drift fails until a check compares a document with
  code. The story-heading check no longer counts: the template's `docs/TODO.md`
  made it run from day one, so setup could end with nothing compared. This can
  turn a gate red: a committed project whose `tools/docs-drift.mjs` adopt
  updates, and which compares nothing with code.
- Every placeholder in the templates is one the slot check counts. One-word
  placeholders such as `<model>` read as HTML tags, so `AGENTS.md` passed
  agent-check with them unfilled.
- bootstrap fills the Name row of `AGENTS.md` §0 with the project's name.

## [0.4.1] - 2026-10-07

### Fixed

- adopt no longer rewrites a seeded file that differs from the starter's copy
  only in its line endings.

## [0.4.0] - 2026-10-07

### Added

- adopt updates a seeded file that still equals one of the starter's earlier
  versions, with a backup; a file the project changed is kept.
- `_starter/AUDIT-2026-10-07-agnostic.md`: a review of whether the starter is
  free of project, stack and owner assumptions.

### Changed

- **Breaking:** agent-check's profile checks run only when the master profile
  (`~/CLAUDE.md` or `~/.claude/CLAUDE.md`) carries the line
  `<!-- operator-profile -->`. To keep them, add the line to the master and
  copy the master over its copies again.
- agent-check compares every block marked `<!-- name:start -->` …
  `<!-- name:end -->`, whatever its name, between the master profile and
  `~/.claude/CLAUDE.md`.
- The `AGENTS.md` template no longer prescribes a commit language, a trailer
  policy or particular agent skills; each is a slot.
- The template's interface rules are WCAG 2.2 AA and an empty, a loading and an
  error state for every view that shows data; `DESIGN.md` keeps only the
  direction fields.
- The template's security, data and container rules apply only where a system
  has accounts, endpoints, a database or local containers; the data section
  can be deleted like the money section.
- The template states its lessons in general terms, and calls the ladder for
  minimal code by what it does, with a `simplification:` marker.
- The operator profile is described as optional, the public README asks for
  one before the first project, and the example leaves the trailer policy to
  whoever installs it.
- `.gitignore` and `.editorconfig` carry no stack-specific entries; Setup adds
  the stack's own.
- `AGENTS.md` §11 marks Codex, Cursor, Copilot and Gemini CLI as documented but
  not yet observed.
- The audit findings B5 and H7 are recorded as accepted limits.

### Fixed

- An HTML comment is no longer counted as an unfilled slot.

## [0.3.0] - 2026-10-07

### Added

- adopt refuses to copy starter files that have uncommitted changes;
  `--allow-dirty` overrides it to test adopt itself.
- adopt records the installed release in the project's
  `.claude/starter-version`.
- adopt reports a project in which no gate runs agent-check.

### Changed

- docs-drift fails once setup is done, that is once `AGENTS.md` has no Setup
  section, and no check ran; Setup asks for at least one check that runs.

### Fixed

- adopt's import helper wrote the byte order mark as a literal character; it is
  an escape again, and the self-test rejects the character in any file.

## [0.2.0] - 2026-10-07

### Added

- adopt adds the `@./AGENTS.md` import to a `GEMINI.md` pointer that lacks it.
- docs-drift checks the `make <target>` commands of a gate against the
  Makefile.

### Changed

- `AGENTS.md` §11 records that Antigravity loads `AGENTS.md` at session start.
- Code comments state their constraint in one or two lines.
- Documents, command output and test fixtures carry no em dash, and story
  headings read `### [STATUS] S0.1: title`.

### Removed

- bootstrap removes `tools/adopt.mjs` from new projects, and the last Setup
  step removes `tools/bootstrap.mjs`.

### Fixed

- The profile check compares Antigravity's global rules,
  `~/.gemini/config/AGENTS.md`, with the master.
- Statements in `AGENTS.md` and `_starter/INTAKE.md` that had fallen behind the
  code.

### Security

- silent-failure-hunter can only read (Read, Grep, Glob); it no longer has
  Bash.

## [0.1.0] - 2026-10-05

The first public release.

### Added

- The public repository, imported without the details of other private
  repositories.
- A landing page (`.github/README.md`), a maintenance guide
  (`_starter/README.md`) and the audit behind this release
  (`_starter/AUDIT-2026-10-05.md`).
- CI runs the self-test and docs-drift on Ubuntu, macOS and Windows, and
  `.gitattributes` keeps every checkout LF.
- An example operator profile (`_starter/operator-profile.md`), and the
  `@./AGENTS.md` import in `GEMINI.md`.
- docs-drift checks that at most one story is in WIP and that nothing past
  Epic 0 starts before it is done.

### Changed

- Each rule has one home: the review ladder in
  `.claude/rules/review-severity.md`, the working process in the operator
  profile, and only the owner's direction in `DESIGN.md`.
- `AGENTS.md` follows a framework's own layout (§3), decomposes the PRD first
  (§0.1), maps commit types to version bumps as Conventional Commits does (§7),
  and states what each rule is in each tool (§11).

### Fixed

- The docs-first hook failed open after a `cd`, and let through `docs/../`
  paths, NotebookEdit and application code under `tools/`.
- The gate-command check read package-manager subcommands as scripts, and
  passed `npm test` with no `test` script.
- bootstrap could dismantle a clone named `agent-project-starter`, took
  `--apply` as a project name, and left the starter's `LICENSE` in projects.
- Slots that wrapped onto a second line, and placeholder words such as `TBD`,
  went uncounted; the pointer check accepted an import inside code; the
  60-line pointer limit had two definitions; and the profile checks went red
  on machines without one particular layout.

### Security

- `git push -f`, `git clean` and the common home credential files are denied.
  The denies hold in `bypassPermissions` mode, but do not stop an interpreter.
- Agents never install, update or fetch a skill; the owner installs skills.

[Unreleased]: https://github.com/jaegerama/agent-project-starter/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/jaegerama/agent-project-starter/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/jaegerama/agent-project-starter/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/jaegerama/agent-project-starter/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/jaegerama/agent-project-starter/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jaegerama/agent-project-starter/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jaegerama/agent-project-starter/releases/tag/v0.1.0
