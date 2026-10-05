# GEMINI.md

@./AGENTS.md

The line above imports `AGENTS.md`, where this project's rules live, so Gemini
CLI loads it at session start, as its documentation describes. Keep it on its
own line and outside backticks: an import inside code is skipped.

This file deliberately **carries no rules of its own**. Two copies of a rule
are two sources of truth, and they drift.

The global operator profile (working process, verification, reporting) lives
in `~/.gemini/GEMINI.md`, a copy of the master: `~/CLAUDE.md`, or
`~/.claude/CLAUDE.md` on a machine without one. The copy is never edited
directly.
