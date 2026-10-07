# Brief

The owner's own description of the project, in their words and in whatever
language they wrote it. **This file is the input of setup, and every other template is
filled from it.**

If the brief arrived in chat, the agent copies it here verbatim first, before
touching anything else. A brief that lives only in a chat message is lost on
the next session, a `/clear`, or a switch to another tool.

## Rules for the agent filling the templates from this brief

- Fill a slot only with what this file actually says. Paraphrase is fine;
  addition is not, apart from the slots Setup step 3 says are measured or
  planned.
- A slot the brief does not answer becomes a question in `docs/QUESTIONS.md`
  and stays a slot. A guessed stack, command, or business rule reads exactly
  like a decided one, and it is the most expensive thing setup can produce.
- A stack an operator profile mentions is background, not a default. This
  project's stack is whatever this file says, or a question.
- Delete the template sections that do not apply (no money, no interface) and
  say in the report which ones and why.

## What a useful brief usually covers

None of this is required. Write it however it comes; the agent asks for the rest.

- What it is, who uses it, and what it deliberately is not
- Stack, if already decided, and where it runs
- Whether the repository is pushed to a shared team remote (that decides
  whether agent files are committed or private)
- Whether it has a user interface, and in which languages
- What must never be touched, and who deploys
- The first thing that should exist

---

## The brief

(empty until the owner writes it)
