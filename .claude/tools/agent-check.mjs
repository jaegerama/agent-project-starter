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

// Keeping one profile in every tool is a choice: a master opts in with this line,
// and without it each tool's global notes are its own.
const PROFILE_MARKER = '<!-- operator-profile -->'
const profileMaster = () =>
  [join(homedir(), 'CLAUDE.md'), join(homedir(), '.claude', 'CLAUDE.md')].find((p) => readAbs(p)?.includes(PROFILE_MARKER)) ?? null

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

      return `AGENTS.md still has ${slots.length} unfilled slots: fill them before the first line of application code. For example: ${slots.slice(0, 4).join('  ')}`
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
    name: 'the operator profile is identical across Claude, Codex, Gemini and Antigravity',
    run() {
      // A profile updated in one tool while the others run the old one. Only the
      // copies that exist are compared. Antigravity reads ~/.gemini/config/AGENTS.md.
      const home = homedir()
      const master = profileMaster()
      if (!master) return SKIP(`no operator profile in the home directory carries ${PROFILE_MARKER}`)
      const copies = [
        join(home, '.codex', 'AGENTS.md'),
        join(home, '.gemini', 'GEMINI.md'),
        join(home, '.gemini', 'config', 'AGENTS.md'),
      ].filter((p) => existsSync(p))
      if (copies.length === 0) return SKIP(`no Codex, Gemini or Antigravity copy of ${master} to compare`)

      const body = readAbs(master)
      const stale = copies.filter((p) => readAbs(p) !== body)
      return stale.length === 0
        ? null
        : `operator profile copies have drifted from ${master}: ${stale.join(', ')}. Copy the master over them again`
    },
  },

  {
    name: 'the marked blocks in ~/.claude/CLAUDE.md match the master profile',
    run() {
      // ~/.claude/CLAUDE.md loads in every session, so it can carry blocks of the
      // master between <!-- name:start --> and <!-- name:end -->; the check above cannot see them.
      const master = profileMaster()
      const global = join(homedir(), '.claude', 'CLAUDE.md')
      if (!master) return SKIP(`no operator profile in the home directory carries ${PROFILE_MARKER}`)
      if (master === global) return SKIP('the master is ~/.claude/CLAUDE.md itself, so there is nothing to compare')
      const blocks = (body) => new Map([...(body ?? '').matchAll(/<!-- ([\w-]+):start -->([\s\S]*?)<!-- \1:end -->/g)].map(([, name, text]) => [name, text]))
      const a = blocks(readAbs(master))
      const b = blocks(readAbs(global))
      const names = [...new Set([...a.keys(), ...b.keys()])]
      if (names.length === 0) return SKIP('no marked block in either file')
      const problems = names.flatMap((n) => {
        if (!a.has(n)) return [`block ${n} is in ${global} but not in ${master}`]
        if (!b.has(n)) return [`block ${n} is in ${master} but not in ${global}`]
        return a.get(n) === b.get(n) ? [] : [`block ${n} in ${global} has drifted from ${master}: copy it over again`]
      })
      return problems.length === 0 ? null : problems.join('; ')
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
  console.error('FAIL  no checks are defined, and an empty suite is not a green suite')
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
