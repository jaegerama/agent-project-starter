#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter
/**
 * PreToolUse hook: no Write, Edit or NotebookEdit on application code while
 * AGENTS.md still has unfilled slots (docs-first).
 *
 * Claude Code only. Codex, Antigravity and Gemini never run it, and a file
 * written through Bash never reaches it; there the gate is the only check.
 *
 *   stdin  JSON  { tool_name, tool_input: { file_path | notebook_path }, cwd }
 *   env          CLAUDE_PROJECT_DIR, the project root (falls back to cwd)
 *   exit 0       allow
 *   exit 2       block; stderr goes back to Claude
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, relative, resolve, isAbsolute, sep } from 'node:path'
import { slotsOf } from '../tools/lib/slot.mjs'

// Editable during setup, or the hook would block filling AGENTS.md itself.
// tools/ is listed file by file, so application code placed there stays blocked.
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
  // Fail open on purpose: a workflow guard must never lock a session out. The
  // error is printed, so a broken hook is not mistaken for a working one.
  process.stderr.write(`guard-slots: hook failed, allowing the request: ${error.message}\n`)
  process.exit(0)
}
