# Review: is the starter agnostic? (2026-10-07)

The criterion, number 4 of the four that 1.0.0 needs (`_starter/HANDOFF.md`,
Decisions taken): the starter names no project it is used in, assumes no
language or stack, and holds no preference of its owner as a rule. The license
and copyright notices are the owner's, and stay.

**Scope.** Every tracked file. What reaches a project after bootstrap matters
most; `_starter/`, `LICENSE`, `.github/README.md`, the self-test workflow and
`tools/adopt.mjs` stay in the starter, where the criterion still applies,
because the repository is public. Records (`_starter/CHANGELOG.md`,
`_starter/AUDIT-2026-10-05.md`, this file) are history and are not rewritten to
fit a later rule.

**Method.** A pattern scan for names, paths and machine details, which found
none; then scans for stories about real projects, one tool's vocabulary,
personal policies, and domain or stack assumptions, each hit read in context.
AG-1 was reproduced: a home folder with different notes for Claude Code and
Codex turns agent-check red.

**Priority.** HIGH: every project inherits it, and outside the owner's setup it
is wrong or turns the gate red. MED: owner-specific content that reads as the
project's rules, or stories from real projects. LOW: names, optional defaults,
documents that stay in the starter.

The owner approved all fifteen on 2026-10-07, each to be fixed as proposed;
the Status column names the commit that did it. Nothing was released for it:
the changes wait under `[Unreleased]` until the owner asks for a release.

---

## Findings

| ID | Prio | Where | What | Proposed fix | Status |
|---|---|---|---|---|---|
| AG-1 | HIGH | `.claude/tools/agent-check.mjs:66-89` (check 3) | Requires every tool's global instructions to equal one master. Anyone whose `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md` differ on purpose gets a red gate in every project. Reproduced; the self-test pins it as intended (`master in ~/.claude/CLAUDE.md, drifted Codex copy -> red`) | Opt in by a marker line in the master: compare the copies only when the master carries it, SKIP otherwise. The owner adds the line to his master once and copies it over again | Fixed, `7bdf027`; the owner's master carries the line |
| AG-2 | HIGH | `AGENTS.md:366-371` (§7) | "Conventional Commits v1.0.0, in English" and "never add a `Co-Authored-By` or any AI/tool trailer": the owner's commit language and attribution policy, as every project's rule | Keep Conventional Commits and the rule against overriding the git identity; commit language and trailers become slots the brief answers | Fixed, `6fcd244` |
| AG-3 | HIGH | `AGENTS.md:342-358` (§6 Interface), `DESIGN.md`, `AGENTS.md:486` (§11) | The interface rules are one skill's: its rule numbers (R-02 to R-37), its dials and "draft without direction", and a taste rule, no em dash in UI text, that applies "where antislop is not installed" too. Line 344 points at "every project of this machine"; the §11 row describes the owner's machine ("loaded globally") | State the access and state requirements in their own terms: WCAG 2.1 AA contrast, every control reachable by keyboard with a visible focus, empty, loading and error states, no horizontal overflow, a minimum touch target. Drop the em dash rule. `DESIGN.md` keeps its direction fields without the dials and rule numbers; a style filter is listed, if at all, among the project's own skills (AG-6) | Fixed, `6fcd244` |
| AG-4 | HIGH | `AGENTS.md:314-324` (§6 Security, "non-negotiable") | Assumes accounts, endpoints and a transactional database: an audit row in the same transaction as every mutation, rate limits on unauthenticated endpoints, no account enumeration. A CLI, a library or a static site cannot follow it, and unlike Money and Interface the section is not marked removable | Keep what holds everywhere: no secrets in logs, and authorization decided on the server wherever there is one. Mark the rest "where the system has accounts", "has endpoints", "writes to a database", or make them slots | Fixed, `66cd802` |
| AG-5 | MED | `AGENTS.md:333-340` (§6 Data), `AGENTS.md:47` (Setup step 6) | Assumes a relational database (migrations, foreign keys, keyset pagination) and is not removable; step 6 names only Money and Interface | Head the section "delete if the system keeps no database", and add it to step 6 | Fixed, `66cd802` |
| AG-6 | MED | `AGENTS.md:167-170` (§2.1) | Recommends three named third-party skills with their origins: the owner's toolset, in every project | Keep the rule that an agent never installs or fetches a skill; the table becomes this project's skills, empty until its owner adds one | Fixed, `6fcd244` |
| AG-7 | MED | `docs/TODO.md:3-4`, `docs/README.md:31-32, 40-41, 57-58`, `docs/QUESTIONS.md:8`, `AGENTS.md:75, 231-233`, `.claude/commands/gate.md:18`, `.claude/commands/docs-drift.md:39`, `.claude/rules/review-severity.md:3, 86` | Stories from real projects, with their numbers: two headings 941 lines apart, 83 open of 76 answered, 34 unformatted files, "every user is internal personnel", "the production project this starter was extracted from" | Keep each lesson as a general statement, and drop "one project" with its numbers. The credit to ECC in `review-severity.md` stays: it names a public source | Fixed, `64d6dbc` |
| AG-8 | MED | `GEMINI.md:12-15`, `CLAUDE.md:23, 33-36`, `AGENTS.md:40-41, 344, 449`, `docs/BRIEF.md:18` | The owner's profile arrangement written as fact: a master at `~/CLAUDE.md` copied to each tool, with a stack list and UI mandates inside it | Say it conditionally ("if you keep a global profile, ..."), and drop what the owner's profile happens to contain | Fixed, `dcd1bc7` |
| AG-9 | MED | `AGENTS.md:270-273` (§5), `tools/bootstrap.mjs` (deletes `_starter/`) | The working process "lives in the operator profile and is not repeated here". On a machine without a profile, a new project has no copy of it, because bootstrap deletes the example in `_starter/operator-profile.md`. `_starter/INTAKE.md` says to install it first, so this is documented, but it assumes the owner's setup | Owner's call: bootstrap keeps the example as `docs/WORKING-PROCESS.md` when the machine has no profile, or the public README makes installing it the first step | Fixed, `7bdf027` and `dcd1bc7`: the README asks for a profile first, §5 names the example |
| AG-10 | LOW | `AGENTS.md:70` (§0) | "technical terms stay in English either way": the owner's language policy inside a slot | Drop the clause; the project decides | Fixed, `6fcd244` |
| AG-11 | LOW | `.gitignore:8-15`, `.editorconfig:11-12` | The owner's stacks pre-filled: node_modules, vendor, .next, \_\_pycache\_\_, and a 4-space indent for Python and PHP | Keep the universal entries; a comment asks setup to add this stack's directories and style. The Makefile tab stays, because make requires it | Fixed, `fae5b8a` |
| AG-12 | LOW | `AGENTS.md:285, 297` (§5) | "Ponytail ladder" and the `ponytail:` marker: a personal name that tells anyone else nothing. The default itself is already marked optional | Name it for what it does ("the minimal-code ladder", a `simplification:` marker); keep the default | Fixed, `6fcd244` |
| AG-13 | LOW | `AGENTS.md:444-448` (§10) | Three Docker rows, a memory budget against a machine budget, data volumes and local image tags: one laptop's practice as default rows, though removable | One optional line instead: if the project runs containers locally, their memory limits, data volumes and image tags | Fixed, `66cd802` |
| AG-14 | LOW | `.claude/tools/agent-check.mjs:91-115` (check 4) | Checks the owner's antislop block between two home files. Everyone else gets a SKIP line naming a tool they may not use, in every gate run | Take it out of the project gate, or use neutral markers that the owner re-marks once | Fixed, `7bdf027`: any marker name counts, so existing markers need no change |
| AG-15 | LOW | `_starter/README.md:109, 122-123, 153`, `_starter/INTAKE.md:98-110` | Documents that stay in the starter: "persona" in a heading the example profile does not have; the owner's machine history (a profile with port 3000); a story from the source project; INTAKE says the profile covers persona, tone, output format and business rules, which the shipped example does not | Describe what `_starter/operator-profile.md` actually covers, and drop the stories | Fixed, `7bdf027` and `64d6dbc` |

---

## What already holds

- No project name, personal path, registry or machine measurement in any
  tracked file. The copyright holder is named only in the license and the
  SPDX notices.
- The tools take no stack for granted: docs-drift's examples cover npm, pnpm,
  yarn, composer and make and skip with a reason elsewhere; the hook,
  bootstrap and adopt work on files alone.
- Stack, commands and business rules are slots, never defaults (§2, §4, §9).
- Money and Interface are marked removable, and the Definition of Done says to
  delete the items that do not apply.
- `review-severity.md` frames its CRITICAL list as applying to "any system
  that has users, data, or money".

## How the decisions went

- AG-1 and AG-14 change what agent-check does: both profile checks run only for
  a master marked with `<!-- operator-profile -->`, and the block check reads
  any marker name, so markers another installer already writes keep working.
  The owner's master got the line and was copied over its copies again.
- AG-9 took the lighter option: the public README makes installing a profile
  the first step, and `AGENTS.md` §5 names the example.
- AG-2 to AG-6 took rules out of the template. A project made before the change
  keeps them in its own `AGENTS.md`, because adopt never rewrites that file:
  there they are that project's rules, which is where the criterion wants them.

## Found while fixing

- The slot pattern counted an HTML comment as an unfilled slot, so a marker
  line in a template, or the block an installer appends to `AGENTS.md`, would
  have kept a gate red for good. Fixed in `a5e25b1`, with two cases and one
  mutation.
