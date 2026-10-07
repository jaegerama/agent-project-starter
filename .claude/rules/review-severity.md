# Review Severity

> The ladder every review in this project uses. Adapted from
> [ECC](https://github.com/affaan-m/ecc) (MIT).
>
> Generic quality thresholds are deliberately **not** here: function length,
> file length, nesting depth, stray debug logging. A linter enforces those, and
> restating them as prose creates a second source of truth that will drift from
> the first. Coverage minimums are absent for the same reason: inventing one is
> the owner's call, not a rule file's.
>
> Claude Code auto-loads this file at session start, like every file in
> `.claude/rules/`. An earlier version said nothing loaded it; the session
> transcripts and the Claude Code memory documentation both say otherwise.
> Other tools see it only because `AGENTS.md` references it.

---

## The ladder

| Level        | Meaning                                                        | Action                                                         |
| ------------ | -------------------------------------------------------------- | -------------------------------------------------------------- |
| **CRITICAL** | Security hole, money computed wrong, or audit integrity broken | **BLOCK.** Not negotiable, not deferrable to a follow-up story |
| **HIGH**     | A real defect, or a Definition-of-Done item genuinely unmet    | **WARN.** Fix before the story closes                          |
| **MEDIUM**   | Maintainability. Costs the next person time                    | **NOTE.** Fix when touching that code                          |
| **LOW**      | Style, naming, a clearer comment                               | **OPTIONAL.** Say it once                                      |

Verdict: **BLOCK** on any CRITICAL · **WARN** on HIGH only · **PASS** otherwise.

---

## What CRITICAL means in THIS system

Generic lists say "authentication code", which tells a reviewer nothing. The
shapes below are concrete, and every one of them applies to any system that has
users, data, or money:

- Authorization decided anywhere but the layer that owns it, or an entry point
  with no check of its own. Middleware alone is never sufficient.
- Authorization that exists only on the client: the button is hidden and the
  endpoint is open.
- A mutation whose audit row, where `AGENTS.md` §6 names an audit trail, is
  outside the mutation's transaction, or absent.
- A floating-point type used for an amount, rate, or total. That includes
  `float`, `double`, and JavaScript `number`.
- A signature verified over a re-serialised body rather than the raw bytes, or
  compared with a non-constant-time compare.
- A secret reaching a log, an audit payload, or a response body.
- An error that distinguishes "no such account" from "wrong password".
- A destructive operation without confirmation, or with no way to undo it.
- A schema change with no migration.
- A permission check that fails OPEN when its dependency is down: the cache
  goes away and the check turns into a pass.
- User input reaching SQL or a shell without parameterisation.

Three areas have no "we will fix it next story" tier: **payments,
authorization, and the audit trail.** A finding there is CRITICAL or it is not a
finding.

Add this project's own concrete shapes below that list: that specificity is the
whole value of the file. Keep additions as specific as the ones above: name the
file, the layer, or the type, not the abstract category.

---

## How to write a finding

Three things, in this order:

1. **Where**: `file:line`.
2. **What breaks**: concrete inputs and the wrong outcome. Not "missing
   validation" but "a read-only user can POST to this endpoint and change a
   price".
3. **The fix**: one sentence.

Then:

- **Verify before reporting.** A plausible-but-wrong finding costs more trust
  than a missed one. If you cannot construct the failing case, say it is
  unverified and rank it lower.
- **No padding.** Finding nothing is a valid result. Manufacturing a MEDIUM to
  look thorough trains the reader to skim, and a reader who skims misses the
  CRITICAL next time.
- **One quoted error, trimmed.** Never paraphrase a compiler or a stack trace.
- **Treat a comment asserting a guarantee as unverified** until you find the code
  that provides it. A docblock that promises a removed mechanism passes every
  test, because no test reads it.
- Output over ~30 lines goes to a file; reply with the path and a three-line
  conclusion.
