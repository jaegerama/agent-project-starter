# GEMINI.md

@./AGENTS.md

The line above imports `AGENTS.md`, where this project's rules live, so Gemini
CLI loads it at session start, as its documentation describes. Keep it on its
own line and outside backticks: an import inside code is skipped.

This file deliberately **carries no rules of its own**. Two copies of a rule
are two sources of truth, and they drift.

If this machine keeps an operator profile (working process, verification,
reporting), Gemini CLI reads it from `~/.gemini/GEMINI.md`.
