#!/usr/bin/env node
/**
 * PreToolUse hook: refuses Write/Edit on application code while `AGENTS.md`
 * still holds unfilled slots.
 *
 * This turns "no application code until AGENTS.md is filled" from prose into a
 * mechanism. Before this hook existed the rule was written in three places and
 * nothing enforced it, and prose asking people to remember does not work.
 *
 * ## The limitations to know about
 *
 * Hooks are a Claude Code feature. Codex, Antigravity and Gemini do NOT run
 * this file. In those tools the same rule is still an intention, and
 * `node .claude/tools/agent-check.mjs` is its only enforcement.
 *
 * Even in Claude Code it sees the file tools only. A file written through Bash
 * never reaches it; the gate stays red for that project instead.
 *
 * ## Contract
 *
 *   stdin  JSON  { tool_name, tool_input: { file_path | notebook_path }, cwd }
 *   env          CLAUDE_PROJECT_DIR, the project root (falls back to cwd)
 *   exit 0       allow
 *   exit 2       block: stderr is read back to Claude
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, relative, resolve, isAbsolute, sep } from 'node:path'
import { slotsOf } from '../tools/lib/slot.mjs'

// Files and directories that must stay editable DURING setup. Without this list
// the hook would block filling AGENTS.md itself: a guard that locks the door
// from the inside. tools/ is listed file by file, so code placed there is not.
const SETUP_PATHS = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'HANDOFF.md',
  'DESIGN.md',
  'LICENSE',
  '.gitignore',
  '.gitattributes',
  '.editorconfig',
  'tools/bootstrap.mjs',
  'tools/adopt.mjs',
  'tools/docs-drift.mjs',
]
const SETUP_DIRS = ['docs', '.claude', '.github', '_starter']

const allowed = (rel) => {
  const norm = rel.split(sep).join('/')
  if (SETUP_PATHS.includes(norm)) return true
  return SETUP_DIRS.some((d) => norm === d || norm.startsWith(`${d}/`))
}

const main = () => {
  const raw = readFileSync(0, 'utf8')
  if (!raw.trim()) return 0

  const payload = JSON.parse(raw)
  if (!['Write', 'Edit', 'NotebookEdit'].includes(payload.tool_name)) return 0

  const filePath = payload.tool_input?.file_path ?? payload.tool_input?.notebook_path
  if (!filePath) return 0

  // The session cwd moves with every `cd`; the project root does not.
  const root = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd()
  const agents = join(root, 'AGENTS.md')
  if (!existsSync(agents)) return 0

  const slots = slotsOf(readFileSync(agents, 'utf8'))
  if (slots.length === 0) return 0

  // Resolved before comparing, so `docs/../src/app.ts` is judged as `src/app.ts`.
  const rel = relative(root, resolve(payload.cwd || root, filePath))
  // Outside the project tree, or on another drive: not this hook's business.
  if (rel.startsWith('..') || isAbsolute(rel)) return 0
  if (allowed(rel)) return 0

  process.stderr.write(
    `Blocked: AGENTS.md still has ${slots.length} unfilled slots, ` +
      `so there must be no application code yet (docs-first).\n` +
      `Example slots: ${slots.slice(0, 3).join('  ')}\n` +
      `Fill AGENTS.md §0 §1 §2 §4 first, then run: node .claude/tools/agent-check.mjs\n` +
      `If this file really is part of setup, ask the owner to add it to the setup list ` +
      `in .claude/hooks/guard-slots.mjs.\n`,
  )
  return 2
}

try {
  process.exit(main())
} catch (error) {
  // DELIBERATELY fail-open. This is a workflow guard, not a security check: a
  // bug here must not leave a session unable to edit anything. The failure is
  // printed so it is not silent, because a hook that fails quietly is a hook
  // people believe is guarding something.
  process.stderr.write(`guard-slots: hook failed, allowing the request: ${error.message}\n`)
  process.exit(0)
}
