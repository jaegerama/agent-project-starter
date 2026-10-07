# CLAUDE.md

@AGENTS.md

The line above imports `AGENTS.md`, where this project's rules live, so Claude
Code loads it at session start. Keep it on its own line and outside backticks:
import parsing skips code spans. A pointer that only asks in words to read the
file is one Claude may never act on, and session transcripts showed exactly
that before the import existed.

This file carries no rules of its own. Two copies of a rule are two sources of
truth, and they drift.

## Claude Code only (does not apply to other tools)

| | |
|---|---|
| Review severity ladder | `.claude/rules/review-severity.md`, auto-loaded like every file in `.claude/rules/` |
| Commands | `/gate`, `/docs-drift` |
| Agent | `silent-failure-hunter` |
| Agent-configuration check | `node .claude/tools/agent-check.mjs` |
| Permissions and hooks | `.claude/settings.json` |
| Global operator profile, if the machine keeps one | `~/.claude/CLAUDE.md`, or a `CLAUDE.md` in a parent directory |

**A hook blocks while `AGENTS.md` has slots**, when `.claude/settings.json`
wires it: `.claude/hooks/guard-slots.mjs` refuses Write, Edit and NotebookEdit
outside the setup files, from any working directory. That makes docs-first a
mechanism for the file tools. A file written through Bash never reaches the
hook, and the gate stays red for it. If a genuine setup file gets blocked, the
owner adds its path to `SETUP_PATHS`/`SETUP_DIRS` in that script. Do not
disable the hook.

**A profile in a parent directory is inherited by location.** Claude Code
reads a `CLAUDE.md` from the directories above this project, so a project
moved out from under it inherits nothing, and nothing warns you when that
happens.

**Committed or private depends on the repository.** When `.gitignore` lists
`AGENTS.md` and `.claude/`, this is a private-agents repository (it goes to a
shared team remote): the agent files stay on this machine, and git cannot
restore them, so back them up before anything rewrites them. Otherwise
`.claude/` is committed so the tooling travels with the folder, except
`.claude/settings.local.json`.

**Keeping in step with the starter:** from `project-starter`, run
`node tools/adopt.mjs --into` followed by this folder's path. It updates the
files the starter owns and never overwrites the ones this project customised.
`.claude/starter-version` names the starter release those files came from.
