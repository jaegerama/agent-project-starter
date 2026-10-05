# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [Semantic Versioning](https://semver.org/).

This is the **starter's own** history. A project created from it starts with an
empty `CHANGELOG.md` at the root.

The starter lived in a private repository until 2026-10-05, and that history is
not published: it describes other private repositories. What it taught is kept
where it applies, in the code comments and in the cases of `_starter/selftest.mjs`.

---

## [Unreleased]

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
