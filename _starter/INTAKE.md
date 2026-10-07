# Intake: what to tell a new project so the result is the same

> This used to be a block you pasted into the first chat message. It is not any
> more: **context that lives in a chat message is gone** on a new session, a
> `/clear`, or a switch from Claude to Codex. It belongs in `AGENTS.md`, which
> every tool re-reads every session.
>
> So "giving a new project its context" means **filling `AGENTS.md` §0–§4**,
> once, in a file.

---

## Why a list at all

An agent with no constraints does not produce careful work. It produces
**plausible** work, which is worse, because plausible work passes a glance.

Detailed output comes from four things, and **three of them do not exist on day
one of a new project**:

| What makes the work careful | Available immediately? |
| --- | --- |
| A stated process: docs-first, CHANGELOG first, a Definition of Done | **Yes**: that is what this starter carries |
| A gate that mechanically blocks | Partly: the docs-first hook blocks from day one **in Claude Code only**; the §4 command gate has nothing to test yet |
| Tests that lock documents to code | Partly: the slot check and the profile-sync check run on day one; the rest do not |
| Written-down *why* from things that went wrong | No: it accumulates |

**Claiming all four on day one is how a project ends up with a safety net
everybody trusts and nobody built.**

---

## A. What has to be filled in `AGENTS.md`

The mechanical part (`<PROJECT NAME>`, deleting `_starter/` and the starter's
other files, a fresh `git init`) is done by `node tools/bootstrap.mjs --name "<name>" --apply`. What follows
holds decisions, and no script may guess them. An agent may **transcribe**
them from the owner's brief (`docs/BRIEF.md`, see the Setup section of `AGENTS.md`);
it may not invent the ones the brief leaves out. Those become questions.

| Section | Contents | If it is skipped |
|---|---|---|
| §0 | Name, one sentence, **what it is NOT**, language, first deliverable | The agent invents the scope |
| §0 | Ratified decisions with their reasons | Decisions get reopened every session |
| §1 | Never-touch, who deploys, what CI runs | Something in production gets touched |
| §2 | Locked stack | The first ten minutes of every session go to proposing alternatives |
| §4 | **Commands, exactly as you would type them** | **There is no gate at all** |
| §9 | Business rules that may not be invented: pricing, tax, refunds, retention | A number gets invented and it looks plausible |
| §10 | Machine, ports, services that do not auto-start | An environment bug gets diagnosed as a code bug |

**§4 is the expensive one to skip.** Everything else can be corrected later at
small cost. That one cannot: work gets declared done against no check at all,
and nobody notices for weeks.

Verification is mechanical, not a matter of memory:

```bash
node .claude/tools/agent-check.mjs
```

Red while any slot in `AGENTS.md` is still empty.

---

## B. What must exist before the first line of application code

Not optional, and the order matters:

1. **`AGENTS.md` filled.** A slot left as a placeholder is a rule that reads as
   satisfied and is not.
2. **`CHANGELOG.md`**, empty but present, with an `## [Unreleased]` heading.
   The rule is that the entry is written **before** the code, so the file has to
   be there first or the rule is unenforceable on day one.
3. **`docs/PRD.md` and `docs/TODO.md`** filled. The skeletons already exist.
4. **A first Definition of Done**: `AGENTS.md` §8, with the items that do not
   apply deleted. It will be wrong; what matters is that it exists to be
   corrected.

## C. What to build in the first two weeks, in this order

These are the rows the table above says you cannot have yet. Build them in this
order because each one makes the next cheaper:

1. **The gate.** Take the §4 command block, put it in one command, make it fail
   loudly. Write down *why* each step is there as you add it: by the time you
   need that note you will not remember.
2. **One project-specific drift test.** `.claude/tools/agent-check.mjs` has four
   checks that run from day one; `tools/docs-drift.mjs` holds three examples,
   and it is the file that belongs to this project. One
   check that is genuinely about this project is enough to establish the
   pattern.
3. **The "why" notes.** Every time something costs you an hour, write the cause
   where the next person will trip over it: not in a commit message but in the
   file itself (`AGENTS.md` §4, "Known traps").

---

## D. What you do NOT need to say

Because the operator profile, installed once per machine before the first
project, already covers it (`_starter/operator-profile.md` is the example):

- The working process: docs first, scope containment, targeted reads, state
  kept on disk.
- The verification rules: mutation-check every new assertion, read the exit code
  of the thing you ran, a count is half the check, mark mechanism versus
  intention.
- How to report: verify a finding before reporting it, and finding nothing is a
  valid result.
- How to commit: the machine's own identity, Conventional Commits, and the
  changelog entry before the change.

That business rules may not be invented is already in `AGENTS.md` §9, which
also lists **which** ones: that list is the project-specific part.

---

## E. The honest caveat

A context file cannot make a new project behave like a mature one. It can make
the **process** identical from day one: docs-first, CHANGELOG first, a stated
Definition of Done, and the habit of writing down why.

What it cannot do is give you the accumulated part: the gate that actually
blocks, the tests that catch a stale document, and the notes that stop a mistake
from being made twice. Those take real weeks, and a project that pretends
otherwise is more dangerous than one that admits it, because everybody relaxes
against a net nobody built.

**So when something here is aspiration rather than mechanism, mark it.** That is
the single habit worth carrying over most.
