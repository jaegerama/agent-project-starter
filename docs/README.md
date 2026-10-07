# docs/: what each file is for

`/docs` is the specification. The code implements it, not the other way round,
which is why a stale document here is a defect rather than untidiness: it sends
work in the wrong direction, and the work looks correct while it does.

The four skeletons below already exist in this folder. **Delete the ones this
project does not need.** A document nobody maintains is worse than a document
nobody wrote, because it still gets quoted.

`BRIEF.md` is not one of them: it is the input, not the specification. It holds
the owner's brief verbatim, and every other document here is filled from it during
setup. Keep it afterwards. When a later decision contradicts it, the decision
goes in `ARCHITECTURE.md` or `AGENTS.md` with its reason; the brief stays as
what was asked for at the start.

---

## The four that earn their place in almost every project

| File | Answers | Written when |
| --- | --- | --- |
| `PRD.md` | What is being built, for whom, and what is deliberately out of scope | Before any code |
| `TODO.md` | Epics → stories → **acceptance criteria** | Before each story |
| `ARCHITECTURE.md` | How the parts fit, and which decisions are settled | When the second component appears |
| `QUESTIONS.md` | Everything that still needs a human answer, with stable ids | From day one: it fills faster than you expect |

### `PRD.md`

State the scope, and state the **anti-scope**: what this system is not. That
second half settles more arguments than the first: one line such as "no public
signup" closes a whole family of design discussions before they start.

### `TODO.md`

A story is not a title, it is **acceptance criteria**. If a criterion cannot be
checked by looking at something, it is a wish.

Give each story one status marker and never two. The same story under two
headings, one open and one closed, sends someone to build what already exists.

### `ARCHITECTURE.md`

Record decisions **with their reason**. A decision with no reason gets reopened
by the next person, including the next session of an agent. A decision with a
reason gets reopened only when the reason stops being true, which is correct.

### `QUESTIONS.md`

One row per question, a stable id (`TAX-1`, `AUTH-3`), and the answer written
beside it once it arrives, above what it replaced, so the history survives.

**If you also keep a summary of what is still open, put a check on it.** That
summary is the most-read and least-maintained thing in the folder, and a stale
one sends people to chase answers they already have.

---

## Worth adding when the project reaches them

| File | Add it when |
| --- | --- |
| `DATABASE_SCHEMA.md` | The schema has enough tables that index rationale needs a home |
| `adr/ADR-000N-*.md` | A decision is big enough that its *alternatives* are worth recording |
| `runbook/*.md` | Someone other than you has to operate it, or you have to re-learn it in six months |
| `QA-CHECKLIST.md` | Somebody other than the author will test it |
| `contracts/*.md` | Another team writes a client against you |

### On runbooks

Write down which **machine** a number was measured on. A timeout chosen on a
12-core laptop is a different number on a 2-core server, and nothing in the
number itself says so.

### On a QA checklist

Give every screen a stable id (`BIL-3`, `CUS-7`). It costs nothing and turns
feedback from "the page with the table" into something you can act on without a
second round trip.
