# AGENTS.md — <PROJECT NAME>

> **This is the only place project rules live.** `CLAUDE.md` and `GEMINI.md` are
> pointers to this file and deliberately carry no rules of their own — two
> copies of a rule are two sources of truth, and that is exactly the defect the
> tooling in this repo exists to catch.
>
> Read automatically by: Codex, Antigravity, Cursor, Copilot. Claude Code loads
> it through the `@AGENTS.md` import in `CLAUDE.md`. Gemini arrives here through
> its pointer file.
>
> Read it in full at session start. Do not re-scan the repo to rediscover facts
> recorded here.
>
> **Every `<slot>` must be filled before the first line of application code.** A
> slot left as a placeholder is a rule that reads as satisfied and is not —
> worse than no rule, because it gets quoted back in reviews.
> `node .claude/tools/agent-check.mjs` fails while any slot remains.

---

## Setup — while this file still has slots

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
5. **Decompose the PRD into `docs/TODO.md`**: Follow §0.1 (Autonomous Execution
   Pipeline). Seed Epic 0 (Walking Skeleton) and break core user flows into
   atomic stories with testable criteria. Work strictly one story at a time.
6. **Delete what does not apply**: the Money section with no money; the
   Interface section and `DESIGN.md` with no interface.
7. **Adapt the example checks in `tools/docs-drift.mjs`** to this stack's
   manifest, or leave them SKIP and say why in §4.1.
8. **Report** how many slots were filled, how many became questions, which
   sections were deleted, and the output of `node .claude/tools/agent-check.mjs`.
   Then ask the questions.
9. **Delete this Setup section** once the slot check is green. It has done its
   job, and an inert section still costs every future session its context.

## 0. Project context — fill this first

This section replaces "explain the project in the first chat message". Context
that lives in a chat message is gone on a new session, a `/clear`, or a switch
to another tool. Context that lives in this file is not.

| | |
|---|---|
| **Name** | <> |
| **One sentence** | <what it is, who uses it> |
| **What it is NOT** | <what is deliberately not built — see the note below> |
| **Prose language** | <Indonesian / English> — technical terms stay English either way |
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

1. <e.g. single repository, no monorepo tooling — because ...>
2. <e.g. who owns the source of truth for X — because ...>

## 0.1 Autonomous Execution Pipeline

When executing from a PRD, work in disciplined, verifiable stages. Never implement
multiple unverified features in one leap.

1. **Phase 0: The Walking Skeleton**
   Before building any feature from the PRD, scaffold the minimal project harness
   (entrypoint, test runner, gate configuration). Add one passing assertion and
   prove the gate (§4) exits 0. Feature stories are blocked until Phase 0 is green.

2. **Phase 1: PRD Decomposition into `docs/TODO.md`**
   Break `docs/PRD.md` into discrete Epics and atomic Stories. Every story must
   have testable acceptance criteria verifiable via terminal (command output,
   HTTP status, DB query).

3. **Phase 2: One Story at a Time (Atomic Execution)**
   - Strict rule: Exactly ONE story may be in `[WIP]` across the project at any time.
   - Follow red-green-refactor: assert failure, implement minimal code, verify green.
   - Once verified, record real terminal proof in `HANDOFF.md`, mark `[DONE]`, and only then proceed.

---

## 1. Hard limits for this project

| | |
|---|---|
| **Never touch** | <.env on the server? production? migrations by hand?> |
| **Deploy is done by** | <manually by the owner / a script / CI, and who may run it> |
| **CI** | <runs what, or "nothing — the local gate is the only check"> |
| **Never committed** | <secrets, dumps, private tooling> |

---

## 2. Stack (locked)

Locked means settled. Framework and setup choices are **never a reason to ask** —
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
governance scripts (`tools/*.mjs`), regardless of whether the application itself
is written in Python, Go, Rust, or Node. For non-Node projects, Node.js remains
present only for repository gates; application code obeys its own runtime.

### 2.1 Agent Skills (Curated Stack)

These skills provide operational intelligence and guardrails for autonomous coding
agents (Claude Code, Antigravity, Codex, Cursor). Install or load them according
to the project's requirements:

| Skill | Repository / Origin | Purpose | When to invoke |
|---|---|---|---|
| **`antislop`** | `miqdadbadjuber/anti-slop` | Eliminates AI slop in UI, code comments, and copywriting. | Active on all frontend, styling, and text writing tasks. |
| **`superpowers`** | `obra/superpowers` | Agent workflow engine: planning, systematic debugging, TDD. | Active on task breakdown, debugging regressions, test design. |
| **`ui-ux-pro-max`** | `nextlevelbuilder/ui-ux-pro-max-skill` | 192 reasoning rules, 79 UI styles, color and layout intelligence. | Active when designing new UI components, choosing palettes or typography. |

Do not install skills outside this curated stack without explicit project need.
Skills are loaded on demand to preserve context window capacity.

---

## 3. Directory map

Only the directories that carry meaning, one line each on what belongs there
and, where it is not obvious, what does not.

```
<the directory tree>
```

**Colocation principle:** Organize by domain feature or vertical slice, not horizontal
layer. Keep routes, handlers, UI components, tests, and schemas co-located within
their feature folder. Avoid sprawling horizontal MVC directories (`controllers/`,
`routes/`, `models/` split across the tree) that inflate agent context and scatter
changes across files.

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

### The gate — all green, no exceptions

```bash
<the commands above, in the order they must run, as one block>
```

**Write down why each step is in that list, as you learn it.** Not what it does
— that is obvious from the command — but what went wrong when it was missing.

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
| `CHANGELOG.md` | `git log --oneline` | Commits with no entry. The rule is the entry comes **first** |
| `AGENTS.md` §4 | the project manifest | Gate commands that no longer exist, or were renamed |
| <config example> | <the module that reads it> | A variable in one and not the other — **either** direction is a defect |

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
verification, how to report) lives in the global operator profile and is **not
repeated here** — repeating it would create a second source of truth. Only the
project-specific rules belong below:

1. **Never scan:** <dependency dir>, <build output>, `.git/`, migrations,
   lockfiles, any volume mount.
2. <any other rule that only applies here>

### Code minimalism (The Ponytail ladder)

The best code is the code never written. Before writing application code, evaluate
in strict order and stop at the first rung that holds:
1. **YAGNI:** Does this need to exist right now? Deletion before addition.
2. **Stdlib:** Language standard library solves it? Use stdlib.
3. **Native platform:** Platform feature covers it? Prefer HTML5 tags, CSS rules,
   or database constraints over custom application code.
4. **Existing dependencies:** An existing package solves it? Never add a new
   dependency for what existing tools or a few lines can do.
5. **One-liner:** Can it be a clean one-liner? Ship the one-liner.
6. **Minimum code:** Zero unrequested abstractions (no factory for one product,
   no interface for one implementation, no config for a constant).
7. **Intentional simplifications:** Mark with `// ponytail: [boundary and upgrade path]`.

### Dependency creep ban (Negative boundary)

Never install or add new packages/dependencies (npm, pip, go get, cargo) without an
explicit directive in `docs/PRD.md` or explicit operator approval. Solve problems strictly
within the existing manifest and standard library.

### Token & Context Discipline

Agents must operate with token conservation as a hard operational constraint. Context
bloat degrades model reasoning and inflates session costs:

1. **Grep-first, targeted reads:** Never read an entire file when searching for a symbol
   or implementation. Use grep/search first; read only bounded windows (50–150 lines)
   around the exact match.
2. **Output guard:** Never dump large compiler logs, raw JSON dumps, or full test suites
   into chat or agent context. Pipe commands through head/tail or summarize counts.
   Full logs belong in temporary files on disk.
3. **No re-scanning established trees:** Trust `AGENTS.md` and `HANDOFF.md`. Never re-read
   directory structures, `.gitignore`, or package manifests after they are established.
4. **State on disk, not in context:** Maintain persistent project state in `docs/TODO.md`
   and `HANDOFF.md`. Never rely on conversational memory across multi-turn chats.
5. **Ultra-terse communication:** Strip conversational filler, prompt echoes, and polite
   status phrases. The deliverable is working code backed by real terminal proof.

---

## 6. Conventions

### Review severity ladder (Universal for Claude, Codex, Antigravity, Gemini)

Every review and self-check uses this ladder:

| Level | Meaning | Action |
|---|---|---|
| **CRITICAL** | Security hole, money computed wrong, or audit integrity broken | **BLOCK.** Not negotiable, not deferrable |
| **HIGH** | A real defect, or a Definition-of-Done item genuinely unmet | **WARN.** Fix before the story closes |
| **MEDIUM** | Maintainability defect. Costs the next session or person time | **NOTE.** Fix when touching that code |
| **LOW** | Style, naming, a clearer comment | **OPTIONAL.** Say it once |

Verdict: **BLOCK** on any CRITICAL · **WARN** on HIGH only · **PASS** otherwise.

CRITICAL violations in this repo:
- Client-side-only authorization; unauthenticated mutating entrypoints.
- Missing audit row in the same transaction as data mutation.
- Floating-point type used for money, financial math, or ledger balance.
- Unverified JWT / webhook signatures or plaintext credential logging.

### Security — non-negotiable

- **All authorization is server-side.** Client-side checks are cosmetic.
  Middleware alone is never sufficient — every entry point checks independently.
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
- <Decimal places — and if the currency has no minor unit, say so here.>

### Data

- Schema changes only via a migration. Never an ad-hoc alteration.
- <Which entities soft-delete, and which may never be hard-deleted.>
- <Which tables are append-only, and what enforces it.>
- Every foreign key gets an index. Every list query gets an index that covers
  its **sort**, not only its filter — a screen that paginates by keyset needs
  the index to lead with the same columns the cursor uses.

### Interface <delete if this project is an API / CLI / library / job>

The general UI mandates (dark mode, i18n dictionaries, WCAG 2.1 AA, static modal
backdrop, one h1 per page, unique ids) live in the global operator profile. What
this project adds:

- Breakpoints verified before a story closes: <>
- Dictionary languages: <>
- <design system / component library>
- Direction comes from `DESIGN.md`. UI, copy and code-comment work goes through
  antislop, which the operator profile loads on this machine; without
  `DESIGN.md` any UI is a draft, not a deliverable (antislop R-37).

**Portable UI & Anti-Slop Fallback Defaults (active across all agents):**
- **No visual slop:** No purple-to-blue gradient mesh backgrounds; no heavy dark blur drop-shadows (use 1px `border-border` hairline); no emoji headings.
- **No copywriting slop:** No em dashes (`—`) in UI copy; no generic AI buzzwords ("seamless", "elevate", "delve").
- **Touch targets:** Minimum 44×44 CSS px for all interactive mobile targets (buttons, links, inputs).
- **Spacing system:** Strict 4pt/8pt grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`). No arbitrary values (`p-[17px]`).
- **State coverage:** Every component must explicitly handle empty state (`[]`), loading skeletons, and error boundaries.

---

## 7. Git & Semantic Versioning

- **Conventional Commits v1.0.0**, in English: `type(scope)!: summary`,
  imperative mood, lowercase summary, no trailing period. The body explains why.
  Breaking changes use `!` before the colon and/or a `BREAKING CHANGE:` footer.
  Scopes: <list them — a closed list is what makes them searchable>.

### Semantic Versioning (SemVer 2.0.0)

Every project follows strict Semantic Versioning (`MAJOR.MINOR.PATCH`):
- **PATCH bump (`x.y.Z`):** Backward-compatible bug fixes (`fix:`), refactoring
  (`refactor:`), performance (`perf:`), or build chores (`chore:`).
- **MINOR bump (`x.Y.0`):** New backward-compatible functionality (`feat:`).
  Resets PATCH to 0.
- **MAJOR bump (`X.0.0`):** Incompatible API changes (`BREAKING CHANGE:` or
  `type(scope)!:`). Resets MINOR and PATCH to 0.
- **Pre-v1.0.0 rules:** Initial development starts at `0.1.0`. Breaking changes
  in `0.x` bump MINOR (`0.1.0` -> `0.2.0`); bug fixes bump PATCH (`0.1.0` ->
  `0.1.1`). Promoted to `1.0.0` upon production readiness.
- **Release synchronization:** Version numbers must be synchronized across the
  manifest (`package.json`, `pyproject.toml`, or `version.go`), `CHANGELOG.md`,
  and git tags (`vX.Y.Z`).

- **Commit with the machine's own git config.** Never override the identity, and
  never add a `Co-Authored-By` or any AI/tool trailer.
- Branches: <model>.
- **`CHANGELOG.md` is updated BEFORE the code change**, not after.

---

## 8. Definition of Done

1. Acceptance criteria in `docs/TODO.md` all satisfied.
2. Story executed atomically (strictly ONE story in `[WIP]` at any time).
3. Phase 0 walking skeleton verified before feature stories began.
4. The gate is green — every command in §4.
5. Authorization enforced server-side, with a negative test (wrong role ⇒ denied).
6. Mutating paths emit an audit row.
7. Empty, loading, and error states visually and logically handled.
8. Zero unapproved dependencies added.
9. Real terminal execution evidence recorded in `HANDOFF.md` (HTTP status, exit code, test count). Synthetic claims without command output are rejected.
10. <i18n complete — every key in every dictionary.>
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
| **Ports in use** | <— and this is the only place port numbers are recorded> |
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
| Gemini CLI | `GEMINI.md` → this file; plus `~/.gemini/GEMINI.md` | Official Gemini convention |
| Antigravity | assumed `AGENTS.md` | **UNVERIFIED** — test it once in this project (ask the agent: "which rules did you read?") then update this row |

The global operator profile (persona, hard limits, working process, verification)
is not inherited across tools automatically. Its master is
`~/.claude/CLAUDE.md` (or platform equivalent), copied to `~/.codex/AGENTS.md` and
`~/.gemini/GEMINI.md`. Change the master first, then copy — never edit a copy.

### Which of these is a mechanism, and which is still an intention

| Rule | Claude Code | Codex / Antigravity / Gemini |
|---|---|---|
| This file is in the agent's context | **Mechanism** (observed 2026-09-24) — the `@AGENTS.md` import | Codex, Antigravity: native. Gemini: **Intention** — the pointer asks in words |
| No application code until `AGENTS.md` is filled | **Mechanism for the file tools**: the PreToolUse hook `.claude/hooks/guard-slots.mjs` blocks Write, Edit and NotebookEdit from any working directory. A file written through Bash is not seen | **Intention**: no hook, only `node .claude/tools/agent-check.mjs` |
| Zero unfilled slots in `AGENTS.md` | **Mechanism** — gate goes red | **Mechanism** — same gate, run by hand |
| Pointer files carry no rules, and `CLAUDE.md` keeps its import line | **Mechanism**: gate goes red | **Mechanism** |
| Docs-first, scope containment, CHANGELOG first | **Intention** | **Intention** |
| antislop applied to UI, copy and comments | **Intention** — loaded globally; transcripts show sessions writing UI copy without it | **Intention** |
| Agent files match the current starter | **Mechanism only when** `node tools/adopt.mjs` is re-run from the starter; otherwise they drift silently | same |

Hooks are a Claude Code feature. Working in Codex or Antigravity, the first row
guards nothing — run the gate yourself. Relaxing against a net that is not
strung in the tool you are actually using is the most expensive failure mode in
this repo.
