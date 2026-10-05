# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [Semantic Versioning](https://semver.org/).

This is the **starter's own** history. A project created from it starts with an
empty `CHANGELOG.md` at the root.

The starter lived in a private repository until 2026-10-05, and that history is
not published: it describes other private repositories. What it taught is kept
where it applies, in the code comments and in the cases of `_starter/selftest.mjs`.

---

## [Unreleased]

### Added: the starter, imported into a public repository (2026-10-05)

Imported with the details of other private repositories removed: their names,
registry and image names, machine measurements, and the laptop maintenance
scripts, which stay on the machine they were written for. The one code change
the import needs is in bootstrap, which recognises a copied starter by its
root commit: it now accepts the public root commit as well as the private one.
