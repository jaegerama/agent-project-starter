---
description: Detect drift between the docs, the CHANGELOG, and what the code actually does.
argument-hint: '[doc]: check a single document'
---

# Docs Drift

Find every place a document and the code disagree, and name which side is wrong.

> `/docs` is the specification and the code implements it, so this command
> **reports disagreement** rather than overwriting either side. Which side is
> wrong is a judgement, and it is the reader's to make with the reason in front
> of them.

**Input**: $ARGUMENTS, an optional single document.

---

## The pairs to compare

They live in **`AGENTS.md` §4.1**, which also says why they are kept there
and not in this file.

If that table still holds empty slots, that is the first finding to report.

---

## Method

1. Read the document section and the code. Compare **claims**, not wording.
2. For each disagreement, decide which side is wrong:
   - Behaviour changed deliberately → the **doc** is stale. Say what to change.
   - Code diverged from a ratified decision → the **code** is wrong. Say so, and
     do not quietly update the doc to match it.
3. **A summary that restates a list is the first thing to check.** It is the most
   likely to be stale and the most likely to be read, because it sits at the top,
   and a stale one sends its reader after answers that already exist.
4. Where a document restates a **number**, propose a check for
   `tools/docs-drift.mjs` rather than only fixing it. Fixing it by hand is the
   thing that has already failed.

## Output

One table: document, what it claims, what is true, which side to change. Then the
single most consequential one, in a sentence.
