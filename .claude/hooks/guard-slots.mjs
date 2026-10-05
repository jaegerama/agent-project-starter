#!/usr/bin/env node
/**
 * PreToolUse hook: refuses Write/Edit on application code while `AGENTS.md`
 * still holds unfilled slots.
 *
 * This turns "no application code until AGENTS.md is filled" from prose into a
 * mechanism. Before this hook existed the rule was written in three places and
 * nothing enforced it — and prose asking people to remember does not work.
 *
 * ## The limitation to know about
 *
 * Hooks are a Claude Code feature. Codex, Antigravity and Gemini do NOT run
 * this file. In those tools the same rule is still an intention, and
 * `node .claude/tools/agent-check.mjs` is its only enforcement.
 *
 * ## Contract
 *
 *   stdin  JSON  { tool_name, tool_input: { file_path }, cwd }
 *   exit 0       allow
 *   exit 2       block — stderr is read back to Claude
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, relative, isAbsolute, sep } from 'node:path'
import { slotsOf } from '../tools/lib/slot.mjs'

// Files and directories that must stay editable DURING setup. Without this list
// the hook would block filling AGENTS.md itself — a guard that locks the door
// from the inside.
const SETUP_PATHS = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'README.md',
  'CHANGELOG.md',
  'HANDOFF.md',
  'DESIGN.md',
  '.gitignore',
  '.editorconfig',
]
const SETUP_DIRS = ['docs', '.claude', '.github', 'tools', '_starter']

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

  const filePath = payload.tool_input?.file_path
  if (!filePath) return 0

  const cwd = payload.cwd ?? process.cwd()
  const agents = join(cwd, 'AGENTS.md')
  if (!existsSync(agents)) return 0

  const slots = slotsOf(readFileSync(agents, 'utf8'))
  if (slots.length === 0) return 0

  const rel = isAbsolute(filePath) ? relative(cwd, filePath) : filePath
  // Outside the project tree — not this hook's business, and output isolation
  // is covered by another rule.
  if (rel.startsWith('..')) return 0
  if (allowed(rel)) return 0

  process.stderr.write(
    `Blocked: AGENTS.md still has ${slots.length} unfilled slots, ` +
      `so there must be no application code yet (docs-first).\n` +
      `Example slots: ${slots.slice(0, 3).join('  ')}\n` +
      `Fill AGENTS.md §0 §1 §2 §4 first, then run: node .claude/tools/agent-check.mjs\n` +
      `If this file really is part of setup, add its path to ` +
      `SETUP_PATHS/SETUP_DIRS in .claude/hooks/guard-slots.mjs.\n`,
  )
  return 2
}

try {
  process.exit(main())
} catch (error) {
  // DELIBERATELY fail-open. This is a workflow guard, not a security check: a
  // bug here must not leave a session unable to edit anything. The failure is
  // printed so it is not silent — a hook that fails quietly is a hook people
  // believe is guarding something.
  process.stderr.write(`guard-slots: hook failed, allowing the request — ${error.message}\n`)
  process.exit(0)
}
