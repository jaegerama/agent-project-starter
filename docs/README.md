# docs/: what each file is for

`docs/` is the specification: the code implements it, not the other way
round. A stale document here is a defect rather than untidiness, because it
sends work in the wrong direction, and the work looks correct while it does.

`BRIEF.md` is the input: the owner's brief, word for word, from which every
other document here is filled during setup. Keep it afterwards. When a later
decision contradicts it, the decision goes in `ARCHITECTURE.md` or `AGENTS.md`
with its reason, and the brief stays as what was asked for at the start.

## The files every project starts with

| File | Answers | Written when |
| --- | --- | --- |
| `PRD.md` | What is being built, for whom, and what is deliberately left out | Before any code |
| `TODO.md` | The epics, their stories, and each story's acceptance criteria | Before each story |
| `QUESTIONS.md` | Everything that still needs a human answer, each with a stable id | From day one |
| `ARCHITECTURE.md` | How the parts fit, and which decisions are settled | When the second component appears |

Each file states its own rules at the top. Delete the ones this project does
not need: a document nobody maintains is worse than none, because it still
gets quoted.

## Worth adding when the project reaches them

| File | Add it when |
| --- | --- |
| `DATABASE_SCHEMA.md` | The schema has enough tables that the reasons for its indexes need a home |
| `adr/ADR-000N-*.md` | A decision is big enough that its alternatives are worth recording |
| `runbook/*.md` | Someone other than you has to operate it, or you will have to learn it again in six months |
| `QA-CHECKLIST.md` | Somebody other than the author tests it. Give every screen a stable id (`BIL-3`, `CUS-7`), so that feedback names the screen |
| `contracts/*.md` | Another team writes a client against you |
