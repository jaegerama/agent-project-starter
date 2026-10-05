# Operator profile: an example

Rules that hold in every project on one machine, whatever its stack. A
project's own rules live in its `AGENTS.md`; this file holds what does not
change from one project to the next, so no `AGENTS.md` has to repeat it.

**Install it once per machine**, not per project, and adapt it first. It is a
starting point, and every line in it should be one you would defend.

| Tool | Reads | Role |
|---|---|---|
| Claude Code | `~/CLAUDE.md` for projects under your home directory, or `~/.claude/CLAUDE.md` in every session | The master: pick one of the two |
| Codex | `~/.codex/AGENTS.md` | A copy of the master |
| Gemini CLI | `~/.gemini/GEMINI.md` | A copy of the master |

`node .claude/tools/agent-check.mjs` compares the copies with the master and
goes red when one drifts. Edit the master, then copy it over the others.

Everything below the line is the profile.

---

# Working process

- **Docs first.** No application code before the relevant part of `docs/`
  exists and is still true. The documents are the specification; the code
  implements them.
- **Scope.** Work on the active story. Do not read, refactor or fix files
  outside its blast radius.
- **Targeted reads.** Find the location first, then read that range. Never
  dump long logs or a full test run into the conversation: write it to a file
  and give the path.
- **State on disk.** Progress lives in `docs/TODO.md` and `HANDOFF.md`. A new
  session, a `/clear` or a switch of tool loses whatever lived only in the
  conversation.
- **Answer, do not survey.** Give a recommendation, not a comparison of
  options nobody will take.

# Verification

- **Every new assertion is mutation-checked.** Break the fix, see the test go
  red, read its message. An assertion that cannot fail looks exactly like one
  that passes.
- **Read the exit code of the thing you ran,** not of the wrapper around it.
  Pipes, containers and background jobs report their own status.
- **A count is half the check.** "Tests pass" without how many ran means
  nothing.
- **A comment that promises a mechanism is not one.** Treat it as unproven
  until you find the code.
- **Mark mechanism and intention.** A reader must be able to tell a rule a
  machine enforces from a rule that is only written down.

# Reporting

- **Verify before reporting a finding.** A plausible wrong finding costs more
  than a missed one. If you cannot construct the failing case, say it is
  unverified and rank it lower.
- **Finding nothing is a valid result.** A review padded with findings teaches
  its reader to skim.
- **Report what happened.** A failing test is reported as failing, with its
  output; a skipped step as skipped.
- **Fix what breaks an existing rule; ask before changing a rule.** If a
  rule's written reason turns out wrong, fix the reason, not the rule.

# Git

- Commit with the identity configured on the machine. Never override it.
- Conventional Commits 1.0.0: `type(scope)!: summary`, imperative, lowercase,
  no trailing period. The body says why.
- No `Co-Authored-By` or other tool trailer in commits or pull requests.
- The changelog entry is written before the change it describes.
