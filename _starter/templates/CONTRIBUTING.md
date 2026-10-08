# Contributing to <PROJECT NAME>

What a person needs to work in this repository. The agent files stay on each
developer's machine, so the rules people follow are written here.

## The gate

Every change passes it before it is committed. `node tools/gate.mjs` runs the
block below; run `git config core.hooksPath .githooks` once in your clone, and
git runs it before every push as well.

```bash
<the gate from AGENTS.md §4, without the agent-check step>
```

## Commits and branches

<the commit, changelog and branch rules from AGENTS.md §7>

## Where the rest is

What is built and why is in `docs/PRD.md`, the stories in `docs/TODO.md`, the
open questions in `docs/QUESTIONS.md`, and the history in `CHANGELOG.md`.
