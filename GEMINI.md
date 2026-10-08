# GEMINI.md

@./AGENTS.md

Gemini CLI loads this project's rules from `AGENTS.md` through the import
above. Keep that line on its own and outside backticks: an import inside code
is skipped. Rules go in `AGENTS.md`, never here.

Gemini CLI reads the machine's operator profile, where there is one, from
`~/.gemini/GEMINI.md`.
