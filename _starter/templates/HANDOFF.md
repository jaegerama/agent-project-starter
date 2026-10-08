# HANDOFF: <PROJECT NAME>

The first file a new session reads after `AGENTS.md`. It holds **state**, not
rules: what is done, what is decided, what is blocked, and what comes next.
Rules belong in `AGENTS.md`; a rule written here is a second copy of it.

Update it before a session ends. A handoff written at the start of the next
session is written from memory, and memory is exactly what the next session
does not have.

---

## Next Immediate Steps

The name matters: "continue step 1 of Next Immediate Steps" is how a session is
asked to pick up work. Numbered, in order, each one specific enough to start
without asking. Strike a step through when it is done, with the date and where
the proof is; do not delete it until the next handoff.

1. (nothing yet)

## Done

What exists and works, with where it was verified. "Works" means it was run,
not that the code was written. **Attach the real terminal proof** (command executed,
exit code 0, test pass count, or HTTP status). Never record a task as Done
without runnable evidence.

## Decisions taken

One line each, with the reason. A decision recorded here that has become a
lasting rule moves to `AGENTS.md` §0 "Ratified decisions".

## Blocked and pending

What is waiting, and on whom: the owner, a third party, a missing credential.

## Daily commands

The handful actually typed every day. The full list and the gate are in
`AGENTS.md` §4; this is the short version, not a copy.

## Before closing any session

- [ ] Next Immediate Steps reflects reality, top item first
- [ ] Everything claimed as done was run, and the proof is named
- [ ] `CHANGELOG.md` has the entry for what changed
- [ ] Nothing half-done is left uncommitted without a line here saying so
