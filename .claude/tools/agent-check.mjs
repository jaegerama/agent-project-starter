#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter
/**
 * Fails when the agent configuration of this project, or of this machine, has
 * drifted from what the starter guarantees.
 *
 *     node .claude/tools/agent-check.mjs
 *
 * It lives in .claude/, apart from tools/docs-drift.mjs, because a team
 * repository ignores .claude/. The starter owns it and adopt overwrites it, so
 * a fix belongs in the starter. Node only, no dependencies, any stack.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { slotsOf } from './lib/slot.mjs'
import { isPointer, importsAgents } from './lib/pointer.mjs'

const root = process.cwd()
const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : null)
const readAbs = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null)

// A check returns null (passed), a sentence (failed: what disagrees), or
// SKIP(reason) when it cannot run yet. A skip is not a pass, and the output says so.
const SKIP = (reason) => ({ skipped: reason })

const CHECKS = [
  {
    name: 'no unfilled <> slots remain in AGENTS.md',
    run() {
      // A slot left as a placeholder reads like a satisfied rule. This is the one
      // check that can go red on day one, before any application code exists.
      const doc = read('AGENTS.md')
      if (!doc) return SKIP('no AGENTS.md yet')

      const slots = slotsOf(doc)
      if (slots.length === 0) return null

      return `AGENTS.md still has ${slots.length} unfilled slots — fill them before the first line of application code. For example: ${slots.slice(0, 4).join('  ')}`
    },
  },

  {
    name: 'CLAUDE.md and GEMINI.md are still pointers, and CLAUDE.md imports AGENTS.md',
    run() {
      // One rule pasted into a pointer makes a second source of truth. The 60-line
      // limit is a crude fence, and crude on purpose.
      if (!read('CLAUDE.md') && !read('GEMINI.md')) return SKIP('no pointer files yet')

      const offenders = ['CLAUDE.md', 'GEMINI.md']
        .map((p) => [p, read(p)])
        .filter(([, body]) => body !== null && !isPointer(body))
        .map(([p]) => p)
      // Without this line Claude Code never loads AGENTS.md, and nothing else says so.
      const claude = read('CLAUDE.md')
      if (claude !== null && !importsAgents(claude)) offenders.push('CLAUDE.md (no @AGENTS.md import line outside code)')

      return offenders.length === 0
        ? null
        : `pointer files are growing rules of their own, or lost the reference to AGENTS.md: ${offenders.join(', ')}`
    },
  },

  {
    name: 'the operator profile is identical across Claude, Codex and Gemini',
    run() {
      // A profile updated in one tool while the others run the old one. The master
      // is ~/CLAUDE.md, or ~/.claude/CLAUDE.md where there is none; a tool nobody
      // uses here has no copy, so only the copies that exist are compared.
      const home = homedir()
      const master = [join(home, 'CLAUDE.md'), join(home, '.claude', 'CLAUDE.md')].find((p) => existsSync(p))
      if (!master) return SKIP('no operator profile in the home directory')
      const copies = [join(home, '.codex', 'AGENTS.md'), join(home, '.gemini', 'GEMINI.md')].filter((p) => existsSync(p))
      if (copies.length === 0) return SKIP(`no Codex or Gemini copy of ${master} to compare`)

      const body = readAbs(master)
      const stale = copies.filter((p) => readAbs(p) !== body)
      return stale.length === 0
        ? null
        : `operator profile copies have drifted from ${master}: ${stale.join(', ')}. Copy the master over them again`
    },
  },

  {
    name: 'the antislop block in ~/.claude/CLAUDE.md matches the master profile',
    run() {
      // ~/.claude/CLAUDE.md carries only this block, not the profile, so the check
      // above cannot see it go stale.
      const home = homedir()
      const master = join(home, 'CLAUDE.md')
      const global = join(home, '.claude', 'CLAUDE.md')
      const block = (body) => {
        if (body === null) return null
        const start = body.indexOf('<!-- antislop:start -->')
        const end = body.indexOf('<!-- antislop:end -->')
        return start === -1 || end < start ? null : body.slice(start, end)
      }
      // Without ~/CLAUDE.md there is no master to copy the block from.
      if (!existsSync(master)) return SKIP('no ~/CLAUDE.md, so no master block to compare')
      const a = block(readAbs(master))
      const b = block(readAbs(global))
      if (a === null && b === null) return SKIP('no antislop block in either file')
      if (a === null || b === null) {
        return `the antislop block exists in ${a === null ? global : master} but not in ${a === null ? master : global}`
      }
      return a === b ? null : `the antislop block in ${global} has drifted from ${master}: copy it over again`
    },
  },
]

let failed = 0
let ran = 0
let skipped = 0

for (const check of CHECKS) {
  let result
  try {
    result = check.run()
  } catch (error) {
    result = `the check itself threw: ${error.message}`
  }

  if (result && typeof result === 'object' && 'skipped' in result) {
    skipped += 1
    console.log(`SKIP  ${check.name}\n      ${result.skipped}`)
  } else if (result) {
    failed += 1
    ran += 1
    console.error(`FAIL  ${check.name}\n      ${result}\n`)
  } else {
    ran += 1
    console.log(`ok    ${check.name}`)
  }
}

// The denominator is part of the result: "0 ran, 2 skipped" is not a pass.
console.log(`\n${ran - failed} passed, ${failed} failed, ${skipped} skipped of ${CHECKS.length}`)

if (CHECKS.length === 0) {
  console.error('FAIL  no checks are defined — an empty suite is not a green suite')
  process.exit(1)
}

if (ran === 0) {
  console.error(
    '\nNothing was actually checked. That is expected on a new project and it is' +
      '\nnot a pass: until a check runs, the rules it guards are aspiration. Adapt' +
      '\nthe examples above to files this project really has.',
  )
}

process.exit(failed === 0 ? 0 : 1)
