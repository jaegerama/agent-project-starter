# AGENTS.md: <PROJECT NAME>

> **This is the only place project rules live.** `CLAUDE.md` and `GEMINI.md` are
> pointers to this file and deliberately carry no rules of their own: two
> copies of a rule are two sources of truth, and that is exactly the defect the
> tooling in this repo exists to catch.
>
> Read automatically by: Codex, Antigravity, Cursor, Copilot. Claude Code loads
> it through the `@AGENTS.md` import in `CLAUDE.md`, Gemini CLI through the
> `@./AGENTS.md` import in `GEMINI.md`.
>
> Read it in full at session start. Do not re-scan the repo to rediscover facts
> recorded here.
>
> **Every `<slot>` must be filled before the first line of application code.** A
> slot left as a placeholder is a rule that reads as satisfied and is not,
> which is worse than no rule, because it gets quoted back in reviews.
> `node .claude/tools/agent-check.mjs` fails while any slot remains.

---

## Setup, while this file still has slots

The first job of any session in this folder until no slot is left. The owner's
only job is the brief; everything else below is the agent's.

1. **Get the brief into `docs/BRIEF.md`.** If the owner gave it in chat, copy it
   there verbatim before doing anything else. If there is no brief, ask for
   one and stop.
2. **Run the mechanical part:** `node tools/bootstrap.mjs --name "Project Name"
   --apply`, with the name from the brief, adding `--private-agents` when the
   brief says the repository goes to a shared team remote. If the brief does
   not say, that is the first question, because it decides whether this file
   is committed at all. In an existing project brought in with
   `tools/adopt.mjs`, skip this step: the name is set, git exists, and the
   brief is the project's existing `HANDOFF.md` and `README.md`.
3. **Fill every slot the brief answers**: this file first, then `README.md`,
   `docs/PRD.md`, `docs/TODO.md`, `HANDOFF.md`, and `DESIGN.md` if there is an
   interface. Stack, commands and way of working are this project's own, taken
   from the brief. Nothing is carried over from another project, and the stack
   list in the operator profile is background, not a default.
4. **Every slot the brief does not answer** becomes a numbered question in
   `docs/QUESTIONS.md` and stays a slot. Never fill one with a guess.
5. **Decompose the PRD into `docs/TODO.md`**, step 1 of §0.1: Epic 0, the
   walking skeleton, then the core flows as atomic stories with testable
   criteria.
6. **Delete what does not apply**: the Money section with no money; the
   Interface section and `DESIGN.md` with no interface.
7. **Adapt the example checks in `tools/docs-drift.mjs`** to this stack's
   manifest, or leave them SKIP and say why in §4.1.
8. **Report** how many slots were filled, how many became questions, which
   sections were deleted, and the output of `node .claude/tools/agent-check.mjs`.
   Then ask the questions.
9. **Delete this Setup section** once the slot check is green. It has done its
   job, and an inert section still costs every future session its context.

## 0. Project context (fill this first)

This section replaces "explain the project in the first chat message". Context
that lives in a chat message is gone on a new session, a `/clear`, or a switch
to another tool. Context that lives in this file is not.

| | |
|---|---|
| **Name** | <> |
| **One sentence** | <what it is, who uses it> |
| **What it is NOT** | <what is deliberately not built: see the note below> |
| **Prose language** | <the language prose is written in>; technical terms stay in English either way |
| **UI language** | <i18n dictionaries / single language / no UI> |
| **First deliverable** | <docs first / a walking skeleton / a specific feature> |

The "is NOT" half matters more than it looks. One sentence like "not
customer-facing, no public signup, every user is internal personnel" settles a
dozen design arguments without a meeting.

### Ratified decisions (do not re-litigate)

A numbered list, each with one line of WHY. The reason is what stops the
decision being reopened by whoever reads this next, including the next session
of an agent. A decision with no reason gets reopened; a decision with a reason
gets reopened only when the reason stops being true, which is correct.

1. <e.g. single repository, no monorepo tooling, because ...>
2. <e.g. who owns the source of truth for X, because ...>

## 0.1 From PRD to Done

Work in stages that can each be verified. Never build several unverified
features in one leap.

1. **Decompose the PRD into `docs/TODO.md`**, during setup: epics and atomic
   stories, each with acceptance criteria checkable from a terminal (command
   output, HTTP status, a database query). Epic 0 is the walking skeleton.
2. **Build the walking skeleton first**: entrypoint, test runner, the gate in
   §4, and one passing assertion. No story past Epic 0 starts until the gate
   exits 0.
3. **One story at a time.** Exactly one story is `[WIP]`. Red, then green, then
   refactor. Record the real terminal proof in `HANDOFF.md`, mark the story
   `[DONE]`, and only then start the next.

`node tools/docs-drift.mjs` checks the story headings in `docs/TODO.md` for
both rules: one story in WIP, and nothing past Epic 0 started before it is
DONE. Nothing in the repository can prove that the proof in `HANDOFF.md` is
real; a gate re-run by CI, not by the agent that wrote the proof, can.

---

## 1. Hard limits for this project

| | |
|---|---|
| **Never touch** | <.env on the server? production? migrations by hand?> |
| **Deploy is done by** | <manually by the owner / a script / CI, and who may run it> |
| **CI** | <runs what, or "nothing: the local gate is the only check"> |
| **Never committed** | <secrets, dumps, private tooling> |

---

## 2. Stack (locked)

Locked means settled. Framework and setup choices are **never a reason to ask**,
so a session does not spend its first ten minutes proposing alternatives that
were already rejected.

| Layer | Choice | Notes |
|---|---|---|
| Language / runtime | <> | |
| Framework | <> | |
| Database | <> | |
| Migrations | <> | |
| Auth | <> | |
| Validation | <> | |
| Tests | <> | |
| Static analysis | <> | |
| Local environment | <how it runs on this machine: Docker Compose, or on the host> | Local only |
| Dev server | <where and how: host, Docker, a platform; web server; runtime version> | Never inferred from the local setup |
| Production | <where and how, as above> | Never inferred from the local setup |

Delete rows that do not apply. A row filled with `-` is better than a row left
holding angle brackets.

**The local environment is not a mirror of the servers.** A project's Docker
setup is how it runs on this machine; the dev and production servers may run
without Docker, with another web server, other runtime versions and other
services. Never infer a server fact from a compose file, a Dockerfile or a
local image. What the servers run is recorded in the two rows above, or it is
a question.

**Tooling harness vs application runtime:** Node.js is the harness for repository
governance scripts (`tools/*.mjs` and `.claude/`), regardless of whether the
application itself is written in Python, Go, Rust, or Node. For non-Node
projects, Node.js remains present only for repository gates; application code
obeys its own runtime. Node.js 22 or newer must be installed wherever an agent
works on this project: without it the docs-first hook fails open and the gate
cannot run.

### 2.1 Agent skills (optional, installed by the owner)

A skill is a prompt the agent obeys, so **an agent never installs, updates or
fetches one**, and never downloads a `SKILL.md` over the network. The owner
installs skills. The agent uses only what is already on disk, and when a skill
below is missing it says so and works without it.

| Skill | Origin | Use it for | Not for |
|---|---|---|---|
| `antislop` | `miqdadbadjuber/anti-slop` | Removing generic AI patterns from UI, copy and code comments | Choosing a style: it is a filter, and direction comes from `DESIGN.md` |
| `superpowers` | `obra/superpowers` | Planning, systematic debugging, test design | Replacing the process in this file |
| `ui-ux-pro-max` | `nextlevelbuilder/ui-ux-pro-max-skill` | Layout and accessibility craft | Palette, typography or mood: those come from `DESIGN.md`, which the owner writes (antislop R-37) |

Skills load on demand, to keep the context small. Where a skill and this file
disagree, this file wins: it holds the project's rules.

---

## 3. Directory map

Only the directories that carry meaning, one line each on what belongs there
and, where it is not obvious, what does not.

```
<the directory tree>
```

**Colocation:** where the framework has a layout of its own (Laravel, Rails,
Django, the Next.js app router), follow it: the layout its documentation and
tooling expect beats a tidier one they do not. Where it has none, colocate by
feature: a feature's routes, handlers, components, tests and schemas in one
folder, so one change touches one place and an agent reads one folder, not five.

**Output isolation:** every generated file lands inside this tree. Never write
to a parent directory or a sibling project.

---

## 4. Commands

Write them exactly as the owner would type them. Not an approximation.

```bash
# install
<>
# dev
<>
# typecheck / static analysis
<>
# lint
<>
# format check
<>
# unit test
<>
# integration test        (or "none yet")
<>
# build
<>
# e2e                     (or "none yet")
<>
```

### The gate: all green, no exceptions

```bash
<the commands above, in the order they must run, as one block>
```

**Write down why each step is in that list, as you learn it.** Not what it does,
which the command shows, but what went wrong when it was missing.

> *The shape of such a note: "format check is in that line because CI used to
> run it and this file did not. Three stories were pushed and the pipeline
> failed on 34 unformatted files."*

A step with no note is a step somebody will eventually remove as redundant.

Two steps belong in every gate whatever the stack: `node tools/docs-drift.mjs`
(this project's documents against its code) and, where `.claude/` exists,
`node .claude/tools/agent-check.mjs` (agent configuration). In a
private-agents repository the second one is not in the `CONTRIBUTING.md` gate,
because the people who read that file do not have `.claude/`.

### 4.1 Document ↔ code pairs checked for drift

Used by `/docs-drift` and `tools/docs-drift.mjs`. The pattern: a document that
restates something the code defines, and what drifts between them.

| Document | Source of truth in code | What drifts |
|---|---|---|
| <doc and section> | <file> | <the specific claims> |
| `CHANGELOG.md` | `git log --oneline` | Commits with no entry. The rule is the entry comes **first**. Checked by reading (`/docs-drift`), not by the script |
| `AGENTS.md` §4 | the project manifest | Gate commands that no longer exist, or were renamed |
| <config example> | <the module that reads it> | A variable in one and not the other: **either** direction is a defect |

This table is here rather than in `.claude/commands/docs-drift.md` because its
contents are a project decision, and a project rule lives in exactly one place.
Here it is also covered by the unfilled-slot check; in the command file it would
never be checked.

### Known traps

_Empty at first._ Fill it the first time something costs you an hour: a build
that fails only in a container, a watcher that does not watch, a test that
passes or fails depending on whether a service happens to be running. Symptom
first, then cause, then fix: people search by symptom.

---

## 5. Working rules specific to this project

The general working process (docs-first, scope containment, targeted reads,
verification, how to report) lives in the operator profile and is **not
repeated here**: repeating it would create a second source of truth. Only the
project's own rules belong in this section.

1. **Never scan:** <dependency dir>, <build output>, `.git/`, migrations,
   lockfiles, any volume mount.
2. <any other rule that only applies here>

### Defaults this project starts with

Every project created from the starter begins with the two rules below. They are
this project's own now: keep them, change them, or delete them.

**Code minimalism (the Ponytail ladder).** The best code is the code never
written. Before writing application code, go down the ladder and stop at the
first rung that holds:

1. **YAGNI:** does this need to exist right now? Deletion before addition.
2. **Standard library:** does the language's standard library solve it?
3. **Native platform:** does a platform feature cover it? Prefer HTML elements,
   CSS, or a database constraint over custom application code.
4. **Existing dependencies:** does a package already in the manifest solve it?
5. **One-liner:** can it be one clear line?
6. **Minimum code:** no unrequested abstraction: no factory for one product, no
   interface for one implementation, no config for a constant.
7. **Intentional simplification:** mark it with a `ponytail:` comment, in the
   language's own comment syntax, naming the boundary and the upgrade path.

**No new dependency without approval.** Never add a package (npm, pip, go get,
cargo, composer) unless `docs/PRD.md` names it or the owner approves it. Solve
the problem with the manifest and the standard library as they are.

---

## 6. Conventions

### Review severity

Every review and self-check uses the ladder in `.claude/rules/review-severity.md`.
Claude Code loads it at session start; other tools read it before a review.
This project's own CRITICAL shapes are added there, under its list, not here.

### Security (non-negotiable)

- **All authorization is server-side.** Client-side checks are cosmetic.
  Middleware alone is never sufficient: every entry point checks independently.
- Never log secrets, tokens, password hashes, or full account identifiers.
- Every mutating operation writes an audit row **in the same transaction** as
  the mutation.
  <If audit rows are chained or locked, state that lock's scope.>
- <signed callbacks: raw-byte signature check, constant-time compare, replay window, or "none">
- Rate limit every unauthenticated endpoint.
- An error must not distinguish "no such account" from "wrong password".

### Money <delete this whole section if the system holds none>

- **Never a floating-point type for money.** <name the decimal type used here>
- Currency and tax rate come from configuration, never a literal.
- Rounding: <rule>, at <which level>, **once**.
- <Decimal places; if the currency has no minor unit, say so here.>

### Data

- Schema changes only via a migration. Never an ad-hoc alteration.
- <Which entities soft-delete, and which may never be hard-deleted.>
- <Which tables are append-only, and what enforces it.>
- Every foreign key gets an index. Every list query gets an index that covers
  its **sort**, not only its filter: a screen that paginates by keyset needs
  the index to lead with the same columns the cursor uses.

### Interface <delete if this project is an API / CLI / library / job>

UI mandates that hold on every project of this machine, where the operator
profile has any, apply here too. What this project adds:

- Breakpoints verified before a story closes: <>
- Dictionary languages: <>
- <design system / component library>
- Direction comes from `DESIGN.md`. UI, copy and code-comment work goes through
  antislop where it is installed; without `DESIGN.md` any UI is a draft, not a
  deliverable (antislop R-37).

**Where antislop is not installed**, its hard gates still apply, and they are
about function and access, not style: no em dash in UI text (R-02); 44×44 px
touch targets and no horizontal overflow on mobile (R-03); WCAG AA contrast
(R-25); every control reachable by keyboard, with a visible focus (R-32); an
empty, a loading and an error state for every view that shows data (R-27).
Palette, type, spacing, borders and backgrounds come from `DESIGN.md`, never
from a default.

---

## 7. Git & Semantic Versioning

- **Conventional Commits v1.0.0**, in English: `type(scope)!: summary`,
  imperative mood, lowercase summary, no trailing period. The body explains why.
  Breaking changes use `!` before the colon and/or a `BREAKING CHANGE:` footer.
  Scopes: <list them: a closed list is what makes them searchable>.
- **Commit with the machine's own git config.** Never override the identity, and
  never add a `Co-Authored-By` or any AI/tool trailer.
- Branches: <model>.
- **`CHANGELOG.md` is updated BEFORE the code change**, not after.

### Semantic Versioning (SemVer 2.0.0)

Versions are `MAJOR.MINOR.PATCH`, and the commits since the last release decide
the bump. Types other than `feat` and `fix` have no effect of their own, as
Conventional Commits defines them.

| The commits since the last release include | Bump |
|---|---|
| `!` after the type, or a `BREAKING CHANGE:` footer | MAJOR, or MINOR while the version is `0.x` |
| `feat:` | MINOR |
| `fix:` or `perf:` | PATCH |
| only `docs:`, `test:`, `ci:`, `build:`, `chore:`, `refactor:`, `style:` | none: they ship with the next release |

- A project starts at `0.1.0`, and goes to `1.0.0` when it is ready for production.
- **One version everywhere:** the manifest (`package.json`, `pyproject.toml`,
  `version.go` or the like), the `CHANGELOG.md` heading and the git tag `vX.Y.Z`.
  A release is one commit, `chore(release): X.Y.Z`, that turns `[Unreleased]`
  into the version heading and is tagged.

---

## 8. Definition of Done

1. Acceptance criteria in `docs/TODO.md` all satisfied.
2. Story executed atomically (strictly ONE story in `[WIP]` at any time).
3. Phase 0 walking skeleton verified before feature stories began.
4. The gate is green: every command in §4.
5. Authorization enforced server-side, with a negative test (wrong role ⇒ denied).
6. Mutating paths emit an audit row.
7. Empty, loading, and error states visually and logically handled.
8. Zero unapproved dependencies added.
9. Real terminal execution evidence recorded in `HANDOFF.md` (HTTP status, exit code, test count). Synthetic claims without command output are rejected.
10. <i18n complete: every key in every dictionary.>
11. <Responsive at the breakpoints in §6.>
12. Data verified **persisted**, not just rendered optimistically.
13. `CHANGELOG.md` entry present.
14. Relevant `/docs` updated if behaviour diverged from spec.

Delete the items that do not apply to this project. An item left in that does
not apply teaches the reader this list can be skimmed.

---

## 9. Ask, don't assume

If a business rule, domain constraint, or credential is missing, **stop and
ask.** Never invent a default for:

<the ones that apply: pricing, tax, proration, refunds, retention, compliance, external API shapes>

If it costs money or breaks a law, it goes here.

Framework and setup choices are settled in §0–§2 and are never a reason to ask.

---

## 10. Environment

This table is the **local machine**. What the dev and production servers run
belongs in §2, and is never read off this table.

| | |
|---|---|
| **Machine** | <> |
| **Shell and its limitations** | <> |
| **Runtime versions** | <> |
| **Ports in use** | <the ports: this is the only place port numbers are recorded> |
| **Services that do not auto-start** | <> |
| **PATH / filesystem gotchas** | <> |
| **Docker memory budget** | <the sum of the compose services' memory limits, and the machine budget it stays under> |
| **Named volumes that hold data** | <list them: they are never pruned, and a cleanup must be able to tell data from cache> |
| **Images built locally** | <their fixed tags, such as name:local, so a rebuild replaces an image instead of adding one> |

Delete the three Docker rows if this project does not run Docker locally.
Machine-wide limits, where this machine has any, are in the operator profile.

Record **which machine** a number was measured on. A timeout chosen on a 12-core
laptop is a different number on a 2-core server, and nothing in the number
itself says so.

---

## 11. Per-tool notes

| Tool | Reads | Status |
|---|---|---|
| Claude Code | `CLAUDE.md`, which imports this file with `@AGENTS.md`; plus `.claude/` (rules auto-load; commands, agents, settings) | **Verified 2026-09-24**: four sessions' transcripts list `AGENTS.md` among the files loaded through the import. The earlier pointer asked in words, and this file was never loaded |
| Codex | `AGENTS.md` (this file) + `~/.codex/AGENTS.md` | Official Codex convention |
| Cursor / Copilot | `AGENTS.md` (this file) | Official convention |
| Gemini CLI | `GEMINI.md`, which imports this file with `@./AGENTS.md`; plus `~/.gemini/GEMINI.md` | **Documented, not yet observed**: Gemini CLI documents `@` imports in `GEMINI.md`. Confirm it once in a session (ask which files it loaded), then mark it verified |
| Antigravity | assumed `AGENTS.md` | **UNVERIFIED**: test it once in this project (ask the agent which rules it read), then update this row |

The operator profile (working process, verification, reporting, git) is not
inherited across tools automatically. Its master is `~/CLAUDE.md`, or
`~/.claude/CLAUDE.md` on a machine without one, copied to `~/.codex/AGENTS.md`
and `~/.gemini/GEMINI.md`. Change the master first, then copy; never edit a
copy. A machine with no profile can start from `_starter/operator-profile.md`
in the starter repository.

### Which of these is a mechanism, and which is still an intention

| Rule | Claude Code | Codex / Antigravity / Gemini |
|---|---|---|
| This file is in the agent's context | **Mechanism** (observed 2026-09-24): the `@AGENTS.md` import | Codex, Cursor: native. Gemini: the `@./AGENTS.md` import, documented, not yet observed. Antigravity: unverified |
| No application code until `AGENTS.md` is filled | **Mechanism for the file tools**: the PreToolUse hook `.claude/hooks/guard-slots.mjs` blocks Write, Edit and NotebookEdit from any working directory. A file written through Bash is not seen | **Intention**: no hook, only `node .claude/tools/agent-check.mjs` |
| Zero unfilled slots in `AGENTS.md` | **Mechanism**: gate goes red | **Mechanism**: same gate, run by hand |
| Pointer files carry no rules, and `CLAUDE.md` keeps its import line | **Mechanism**: gate goes red | **Mechanism** |
| One story in WIP; nothing past Epic 0 before it is DONE | **Mechanism**: `tools/docs-drift.mjs` reads the story headings | **Mechanism**: same gate, run by hand |
| Secret files are not read | **Partial**: the Read tool and common shell readers are denied, even in `bypassPermissions` mode; an interpreter one-liner is not. The sandbox closes that, on macOS, Linux and WSL2 only | **Intention** |
| No new dependency without approval | **Partial**: in the default permission mode, a command that is not allowlisted asks first. `bypassPermissions` and a direct edit of the manifest are not guarded | **Intention** |
| Docs-first, scope containment, CHANGELOG first | **Intention** | **Intention** |
| antislop applied to UI, copy and comments | **Intention**: loaded globally, and transcripts show sessions writing UI copy without it | **Intention** |
| Agent files match the current starter | **Mechanism only when** `node tools/adopt.mjs` is re-run from the starter; otherwise they drift silently | same |

Hooks are a Claude Code feature. Working in Codex or Antigravity, the hook row
guards nothing: run the gate yourself. Relaxing against a net that is not
strung in the tool you are actually using is the most expensive failure mode in
this repo.
