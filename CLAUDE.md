# CLAUDE.md

@AGENTS.md

Claude Code loads this project's rules from `AGENTS.md` through the import
above, at session start. Keep that line on its own and outside backticks:
import parsing skips code spans, and an earlier pointer that only asked in
words to read the file was never acted on. Rules go in `AGENTS.md`, never
here; this file holds only what applies to Claude Code alone.

## Claude Code only

| | |
|---|---|
| Review severity ladder | `.claude/rules/review-severity.md`, loaded automatically like every file in `.claude/rules/` |
| Commands | `/gate`, `/docs-drift` |
| Agent | `silent-failure-hunter` |
| Permissions and hooks | `.claude/settings.json` |
| Global operator profile, if the machine keeps one | `~/.claude/CLAUDE.md`, or a `CLAUDE.md` in a parent directory |

**The slot hook** (`AGENTS.md` §11) refuses application code while
`AGENTS.md` has slots, once `.claude/settings.json` wires it. If a genuine
setup file is blocked, the owner adds its path to `SETUP_PATHS` or
`SETUP_DIRS` in `.claude/hooks/guard-slots.mjs`. Do not disable the hook.

**A profile in a parent directory is inherited by location.** Claude Code
reads a `CLAUDE.md` from the directories above this project, so a project
moved out from under it inherits nothing, and nothing warns you when that
happens.
