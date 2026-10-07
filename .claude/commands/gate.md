---
description: Run the full verification gate and report pass/fail per check.
---

# Gate

Run every check in `AGENTS.md` §4, in order, and report the result of each.

## Rules

1. **Run them all, even after one fails.** A report saying "typecheck failed" and
   nothing else hides three more problems and costs another round trip. The
   exception is a step that cannot run because an earlier one did not produce its
   input: say that explicitly rather than reporting a false pass.

2. **Read the exit code of the thing you ran, not of the wrapper around it.** A
   command inside a container, a pipe, or a background job reports the wrapper's
   status, so a failed build behind a passing log tail looks like success. Where
   a wrapper is involved, echo the inner status explicitly so it lands in the
   output you actually read.

3. **A count is half the check.** "Tests passed" means nothing without how many
   ran. A truncated run and a clean run look identical in a summary line; they
   differ in the collected count.

4. **Do not fix anything while running the gate.** Report, then fix, then re-run.
   A gate that edits what it measures is not a measurement.

5. **State the environment.** Which services were up, which were stopped. If a
   suite's result depends on that, it is not the environment's fault: it is a
   defect in the test, and worth reporting as one.

6. **`node .claude/tools/agent-check.mjs` and `node tools/docs-drift.mjs` are
   part of the gate**, not extras. The first is the only step that can go red
   before there is any application code; the second is where this project's
   own document-against-code checks live.

## Output

A table: check, pass/fail, count where there is one, and the first real error
line for anything red. Then one sentence: green, or what to fix first.

Full logs go to a file. Do not paste them.
